import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { handle } from 'hono/vercel';
import { Redis } from '@upstash/redis';
import { config } from './config/environment';
import type { User } from './types/user';
import type { GoogleTask } from './types/google-api';
import { GoogleAuthService } from './services/google-auth.service';
import { GoogleTasksService } from './services/google-tasks.service';
import { UserService } from './services/user.service';

// Initialize Redis
const redis = Redis.fromEnv();

// Initialize Services
const googleAuthService = new GoogleAuthService();
const googleTasksService = new GoogleTasksService();
const userService = new UserService(redis);

// Export config for Vercel
export { config };

// --- HONO APP SETUP ---
const app = new Hono().basePath('/api');

// --- MIDDLEWARE ---
app.use(logger());

// --- ROUTES ---

// 0. Index - Generate Google OAuth URL
app.get('/', async (c) => {
  const authUrl = googleAuthService.generateAuthUrl();

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
    const tokens = await googleAuthService.exchangeCodeForTokens(code);
    const userProfile = await googleAuthService.getUserProfile(tokens.access_token);

    const id = userProfile.id;
    const user: User = {
      id,
      tokens: tokens,
      syncedTaskIds: [],
      profile: {
        email: userProfile.email,
        name: userProfile.name,
        given_name: userProfile.given_name,
        family_name: userProfile.family_name,
        picture: userProfile.picture,
      },
    };

    await userService.saveUser(user);

    return c.html(
      `<h2>✅ Auth Successful!</h2>
       <p>Welcome, <strong>${userProfile.name}</strong>!</p>
       <p>Your email: <code>${userProfile.email}</code></p>
       <p>Your ID is: <code>${id}</code></p>`
    );
  } catch (error) {
    console.error('Authentication error:', error);
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
    const task = await userService.callGoogleAPIWithRefresh(
      userId,
      (accessToken) => googleTasksService.createTask(accessToken, title, notes, due)
    );
    return c.json({ message: 'Task created.', taskId: task.id }, 201);
  } catch (error) {
    console.error('Webhook error:', error);

    if (
      error instanceof Error &&
      error.message.includes('User needs to re-authenticate')
    ) {
      return c.json(
        {
          error: 'Authentication expired. Please re-authorize the app.',
        },
        401
      );
    }

    return c.json({ error: 'Failed to create task in Google.' }, 500);
  }
});

// 3. Fetch Endpoint: Google Tasks -> Apple Reminders
app.get('/fetch-updates/:userId', async (c) => {
  const userId = c.req.param('userId');

  try {
    const response = await userService.callGoogleAPIWithRefresh(
      userId,
      (accessToken) => googleTasksService.listTasks(accessToken)
    );

    // Get the latest user data (might have been updated during token refresh)
    const user = await userService.getUserById(userId);
    if (!user) {
      return c.json({ error: 'User not found after API call.' }, 404);
    }

    const allTasks = response.items || [];
    const newTasks = allTasks.filter(
      (task: GoogleTask) => !user.syncedTaskIds.includes(task.id)
    );

    if (newTasks.length > 0) {
      const newTaskIds = newTasks.map((task: GoogleTask) => task.id);
      await userService.updateSyncedTaskIds(userId, newTaskIds);
    }

    return c.json(newTasks);
  } catch (error) {
    console.error('Fetch-updates error:', error);

    if (
      error instanceof Error &&
      error.message.includes('User needs to re-authenticate')
    ) {
      return c.json(
        {
          error: 'Authentication expired. Please re-authorize the app.',
        },
        401
      );
    }

    return c.json({ error: 'Failed to fetch tasks from Google.' }, 500);
  }
});

// --- Vercel Export ---
export default handle(app);
