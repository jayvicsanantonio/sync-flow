import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { createClient } from 'redis';
import { google } from 'googleapis';

const redis = await createClient().connect();

export const config = {
  runtime: 'edge',
};

// --- CONFIGURATION from Environment Variables ---
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_BASE_URL } =
  process.env;

const REDIRECT_URL = `${SERVER_BASE_URL}/api/auth/google/callback`;

// --- HONO APP SETUP ---
const app = new Hono().basePath('/api');

// --- GOOGLE OAUTH CLIENT ---
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URL
);

// --- ROUTES ---

// 1. Google OAuth Callback
app.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  if (!code) {
    return c.text('Authorization code is missing.', 400);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
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

  const user = JSON.parse(userJSON);
  const { title, notes, due } = await c.req.json();
  oauth2Client.setCredentials(user.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

  try {
    const task = await tasks.tasks.insert({
      tasklist: '@default',
      requestBody: { title: title || 'New Reminder', notes, due },
    });
    return c.json(
      { message: 'Task created.', taskId: task.data.id },
      201
    );
  } catch (error) {
    return c.json({ error: 'Failed to create task in Google.' }, 500);
  }
});

// 3. Fetch Endpoint: Google Tasks -> Apple Reminders
app.get('/fetch-updates/:userId', async (c) => {
  const userId = c.req.param('userId');
  const userJSON = await redis.get(`user:${userId}`); // Get user data from Redis
  if (!userJSON) {
    return c.json({ error: 'User not found.' }, 404);
  }

  const user = JSON.parse(userJSON); // Parse the JSON string
  oauth2Client.setCredentials(user.tokens);
  const tasks = google.tasks({ version: 'v1', auth: oauth2Client });

  try {
    const response = await tasks.tasks.list({
      tasklist: '@default',
      showCompleted: false,
      showHidden: false,
    });

    const allTasks = response.data.items || [];
    const newTasks = allTasks.filter(
      (task) => !user.syncedTaskIds.includes(task.id)
    );

    if (newTasks.length > 0) {
      const newTaskIds = newTasks.map((task) => task.id);
      user.syncedTaskIds.push(...newTaskIds);

      // Save the updated user object back to Redis
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
