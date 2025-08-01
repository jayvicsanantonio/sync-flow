import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { SyncFlowError } from './utils/errors';
import { Redis } from '@upstash/redis';
import { GoogleAuthService } from './services/google-auth';
import { GoogleTasksService } from './services/google-tasks';
import { UserService } from './services/user';
import { createHomeHandler } from './handlers/home';
import { createAuthHandler } from './handlers/auth';
import { createWebhookHandler } from './handlers/webhook';
import { createSyncHandler } from './handlers/sync';

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
export const config = {
  runtime: 'edge',
};

// --- HONO APP SETUP ---
const app = new Hono().basePath('/api');

// --- MIDDLEWARE ---
app.use(logger());
app.use(cors());
app.use(async function errorHandler(c: Context, next: Next) {
  try {
    await next();
  } catch (error) {
    console.error('Request error:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      url: c.req.url,
      method: c.req.method,
      userAgent: c.req.header('user-agent'),
    });

    if (error instanceof SyncFlowError) {
      return c.json(
        {
          error: error.message,
          code: error.code,
          ...(error.details && { details: error.details }),
        },
        error.statusCode as ContentfulStatusCode
      );
    }

    return c.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      500 as ContentfulStatusCode
    );
  }
});

// --- VALIDATION SCHEMAS ---
const userIdParamSchema = z.object({
  userId: z.string().min(1).trim(),
});

const webhookBodySchema = z.object({
  title: z.string().min(1).trim(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
});

const authCallbackQuerySchema = z.object({
  code: z.string().min(1),
});

// Export types for use in handlers if needed
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type WebhookBody = z.infer<typeof webhookBodySchema>;
export type AuthCallbackQuery = z.infer<
  typeof authCallbackQuerySchema
>;

// --- ROUTES ---
app.get('/', handleHome);
app.get(
  '/auth/google/callback',
  zValidator('query', authCallbackQuerySchema),
  handleGoogleCallback
);
app.post(
  '/webhook/:userId',
  zValidator('param', userIdParamSchema),
  zValidator('json', webhookBodySchema),
  handleWebhook
);
app.get(
  '/fetch-updates/:userId',
  zValidator('param', userIdParamSchema),
  handleFetchUpdates
);

// --- Vercel Export ---
export default handle(app);
