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
    const errorText = await response.text();
    console.error('Google Tasks API Error:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      requestData: taskData
    });
    throw new Error(`Failed to create task: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Refresh Google OAuth tokens
async function refreshGoogleTokens(refreshToken: string) {
  console.log('Refreshing Google tokens...');
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to refresh tokens:', errorText);
    throw new Error('Failed to refresh Google tokens');
  }

  const newTokens = await response.json();
  console.log('Successfully refreshed tokens.');
  return newTokens;
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
    const errorText = await response.text();
    console.error('Google Tasks API Error (list):', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Failed to fetch tasks: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

// Helper function to call Google API with automatic token refresh
async function callGoogleAPIWithRefresh(
  userId: string,
  apiCall: (accessToken: string) => Promise<any>
) {
  // Get user data from Redis
  const userJSON = await redis.get(`user:${userId}`);
  if (!userJSON) {
    throw new Error('User not found');
  }

  let user;
  if (typeof userJSON === 'string') {
    user = JSON.parse(userJSON);
  } else {
    user = userJSON;
  }

  try {
    // Try the API call with current access token
    return await apiCall(user.tokens.access_token);
  } catch (error: any) {
    console.log('API call failed, checking if token refresh is needed...');
    
    // Check if it's a 401 error (token expired)
    if (error.message && error.message.includes('401')) {
      console.log('Token expired, attempting refresh...');
      
      if (!user.tokens.refresh_token) {
        throw new Error('No refresh token available. User needs to re-authenticate.');
      }

      try {
        // Refresh the token
        const newTokens = await refreshGoogleTokens(user.tokens.refresh_token);
        
        // Update user data with new tokens
        user.tokens = {
          ...user.tokens,
          access_token: newTokens.access_token,
          // Google might not return a new refresh token, so keep the old one if not provided
          refresh_token: newTokens.refresh_token || user.tokens.refresh_token
        };
        
        // Save updated user data back to Redis
        await redis.set(`user:${userId}`, JSON.stringify(user));
        
        console.log('Token refreshed successfully, retrying API call...');
        
        // Retry the API call with new token
        return await apiCall(user.tokens.access_token);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        throw new Error('Token refresh failed. User needs to re-authenticate.');
      }
    } else {
      // If it's not a 401 error, just re-throw the original error
      throw error;
    }
  }
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
  console.log('Webhook called for userId:', userId);
  
  const { title, notes, due } = await c.req.json();
  console.log('Webhook payload:', { title, notes, due });

  try {
    const task = await callGoogleAPIWithRefresh(userId, (accessToken) =>
      createGoogleTask(accessToken, title, notes, due)
    );
    return c.json({ message: 'Task created.', taskId: task.id }, 201);
  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof Error && error.message.includes('User needs to re-authenticate')) {
      return c.json({ error: 'Authentication expired. Please re-authorize the app.' }, 401);
    }
    
    return c.json({ error: 'Failed to create task in Google.' }, 500);
  }
});

// 3. Fetch Endpoint: Google Tasks -> Apple Reminders
app.get('/fetch-updates/:userId', async (c) => {
  const userId = c.req.param('userId');

  try {
    const response = await callGoogleAPIWithRefresh(userId, (accessToken) =>
      listGoogleTasks(accessToken)
    );
    
    // After getting the tasks, we need to get the latest user data again
    // as the token might have been refreshed and the data updated.
    const userJSON = await redis.get(`user:${userId}`);
    if (!userJSON) {
      return c.json({ error: 'User not found after API call.' }, 404);
    }
    
    let user;
    if (typeof userJSON === 'string') {
      user = JSON.parse(userJSON);
    } else {
      user = userJSON;
    }

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
    console.error('Fetch-updates error:', error);
    
    if (error instanceof Error && error.message.includes('User needs to re-authenticate')) {
      return c.json({ error: 'Authentication expired. Please re-authorize the app.' }, 401);
    }
    
    return c.json({ error: 'Failed to fetch tasks from Google.' }, 500);
  }
});

// --- Vercel Export ---
export default handle(app);
