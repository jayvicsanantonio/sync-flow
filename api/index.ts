import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { Redis } from '@upstash/redis';
import { config } from '@/config/environment';
import { GoogleAuthService } from '@/services/google-auth';
import { GoogleTasksService } from '@/services/google-tasks';
import { UserService } from '@/services/user';
import { createHomeHandler } from '@/handlers/home';
import { createAuthHandler } from '@/handlers/auth';
import { createWebhookHandler } from '@/handlers/webhook';
import { createSyncHandler } from '@/handlers/sync';
import { errorHandler } from '@/middleware/error-handler';

// Initialize Redis
const redis = Redis.fromEnv();

// Initialize Services
const googleAuthService = new GoogleAuthService();
const googleTasksService = new GoogleTasksService();
const userService = new UserService(redis, googleAuthService);

// Create Handlers with Dependencies
const handleHome = createHomeHandler(googleAuthService);
const handleGoogleCallback = createAuthHandler(
  googleAuthService,
  userService
);
const handleWebhook = createWebhookHandler(
  googleTasksService,
  userService
);
const handleFetchUpdates = createSyncHandler(
  googleTasksService,
  userService
);

// Export config for Vercel
export { config };

// --- HONO APP SETUP ---
const app = new Hono().basePath('/api');

// --- MIDDLEWARE ---
app.use(logger());
app.use(cors());
app.use(errorHandler);

// --- ROUTES ---
app.get('/', handleHome);
app.get('/auth/google/callback', handleGoogleCallback);
app.post('/webhook/:userId', handleWebhook);
app.get('/fetch-updates/:userId', handleFetchUpdates);

// --- Vercel Export ---
export default handle(app);
