import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { handle } from 'hono/vercel';
import { Redis } from '@upstash/redis';

// Initialize Redis
const redis = Redis.fromEnv();

export const config = {
  runtime: 'edge',
};

// --- CONFIGURATION from Environment Variables ---
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_BASE_URL } =
  process.env;

const REDIRECT_URL = `${SERVER_BASE_URL}/api/auth/google/callback`;

// --- HONO APP SETUP ---
const app = new Hono().basePath('/api');

// --- MIDDLEWARE ---

app.use(logger());

// --- HELPER FUNCTIONS ---

// Exchange authorization code for tokens
async function exchangeCodeForTokens(code: string) {
  const response = await fetch(
    'https://oauth2.googleapis.com/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URL,
        grant_type: 'authorization_code',
      }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to exchange code for tokens');
  }

  return await response.json();
}

// Create a task using Google Tasks API
async function createGoogleTask(
  accessToken: string,
  title: string,
  notes?: string,
  due?: string
) {
  const taskData: any = {
    title: title || 'New Reminder',
  };

  if (notes) taskData.notes = notes;
  if (due) taskData.due = due;

  const response = await fetch(
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to create task');
  }

  return await response.json();
}

// List tasks using Google Tasks API
async function listGoogleTasks(accessToken: string) {
  const response = await fetch(
    'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&showHidden=false',
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }

  return await response.json();
}

// --- ROUTES ---

// 0. Index - Generate Google OAuth URL
app.get('/', async (c) => {
  const scopes = [
    'https://www.googleapis.com/auth/tasks',
    'https://www.googleapis.com/auth/tasks.readonly',
  ];

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID!,
    redirect_uri: REDIRECT_URL,
    response_type: 'code',
    scope: scopes.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  return c.html(`
    <html>
      <head>
        <title>Sync Flow - Google Tasks Integration</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .auth-button {
            background: #4285f4;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
          }
          .auth-button:hover {
            background: #3367d6;
          }
        </style>
      </head>
      <body>
        <h1>🔄 Sync Flow</h1>
        <p>Connect your Apple Reminders with Google Tasks</p>
        <p>Click the button below to authorize access to your Google Tasks:</p>
        <a href="${authUrl}" class="auth-button">Authorize Google Tasks</a>
        <p><small>This will redirect you to Google's authorization page.</small></p>
      </body>
    </html>
  `);
});

// 1. Google OAuth Callback
app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.text('Authorization code is missing.', 400);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const userId = crypto.randomUUID();
    const user = { id: userId, tokens: tokens, syncedTaskIds: [] };

    await redis.set(`user:${userId}`, JSON.stringify(user));

    return c.html(
      `<h2>✅ Auth Successful!</h2><p>Your ID is: <code>${userId}</code></p>`
    );
  } catch (error) {
    return c.text('Authentication failed.', 500);
  }
});

// 2. Webhook: Apple Reminders -> Google Tasks
app.post('/webhook/:userId', async (c) => {
  const userId = c.req.param('userId');
  const userJSON = await redis.get(`user:${userId}`);
  if (!userJSON) {
    return c.json({ error: 'User not found.' }, 404);
  }

  const user = JSON.parse(userJSON as string);
  const { title, notes, due } = await c.req.json();

  try {
    const task = await createGoogleTask(
      user.tokens.access_token,
      title,
      notes,
      due
    );
    return c.json({ message: 'Task created.', taskId: task.id }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create task in Google.' }, 500);
  }
});

// 3. Fetch Endpoint: Google Tasks -> Apple Reminders
app.get('/fetch-updates/:userId', async (c) => {
  const userId = c.req.param('userId');
  const userJSON = await redis.get(`user:${userId}`);
  if (!userJSON) {
    return c.json({ error: 'User not found.' }, 404);
  }

  const user = JSON.parse(userJSON as string);

  try {
    const response = await listGoogleTasks(user.tokens.access_token);
    const allTasks = response.items || [];
    const newTasks = allTasks.filter(
      (task: any) => !user.syncedTaskIds.includes(task.id)
    );

    if (newTasks.length > 0) {
      const newTaskIds = newTasks.map((task: any) => task.id);
      user.syncedTaskIds.push(...newTaskIds);

      await redis.set(`user:${userId}`, JSON.stringify(user));
    }

    return c.json(newTasks);
  } catch (error) {
    return c.json(
      { error: 'Failed to fetch tasks from Google.' },
      500
    );
  }
});

// --- Vercel Export ---
export default handle(app);
