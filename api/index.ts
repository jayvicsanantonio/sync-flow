import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SyncFlowError } from '../src/utils/errors';
import { Redis } from '@upstash/redis';
import { GoogleAuthService } from '../src/services/google-auth';
import { GoogleTasksService } from '../src/services/google-tasks';
import { UserService } from '../src/services/user';
import { createLandingPageHandler } from '../src/handlers/landing';
import { createAuthHandler } from '../src/handlers/auth';
import {
  createCreateTaskWebhookHandler,
  createUpdateTaskWebhookHandler,
  createDeleteTaskWebhookHandler,
} from '../src/handlers/webhook';
import { createFetchSyncHandler } from '../src/handlers/sync';
import { createEarlyAccessHandler } from '../src/handlers/early-access';
import {
  createAdminEarlyAccessHandler,
  createAdminStatsHandler,
} from '../src/handlers/admin';
import { createRateLimiter } from '../src/utils/rate-limit';

const redis = Redis.fromEnv();

const googleAuthService = new GoogleAuthService();
const googleTasksService = new GoogleTasksService();
const userService = new UserService(
  redis,
  googleAuthService,
  googleTasksService
);

const handleLandingPage = createLandingPageHandler(googleAuthService);
const handleGoogleCallback = createAuthHandler(googleAuthService, userService);
const handleCreateTaskWebhook = createCreateTaskWebhookHandler(
  googleTasksService,
  userService
);
const handleUpdateTaskWebhook = createUpdateTaskWebhookHandler(
  googleTasksService,
  userService
);
const handleDeleteTaskWebhook = createDeleteTaskWebhookHandler(
  googleTasksService,
  userService
);
const handleFetchSync = createFetchSyncHandler(googleTasksService, userService);
const handleEarlyAccess = createEarlyAccessHandler(redis);
const handleAdminEarlyAccess = createAdminEarlyAccessHandler(redis);
const handleAdminStats = createAdminStatsHandler(redis);

// Rate limiters
const earlyAccessRateLimit = createRateLimiter(redis, {
  windowMs: 3600, // 1 hour
  max: 5, // 5 requests per hour per IP
  keyPrefix: 'rate-limit:early-access',
  message: 'Too many early access requests. Please try again later.',
});

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

const createTaskWebhookBodySchema = z.object({
  title: z.string().min(1).trim(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  url: z.string().optional(),
  tags: z.string().optional(),
  syncId: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

const updateTaskWebhookBodySchema = z.object({
  syncId: z.string().min(1).trim(),
  title: z.string().min(1).trim().optional(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  priority: z.enum(['None', 'Low', 'Medium', 'High']).optional(),
  isCompleted: z.boolean().optional(),
  url: z.string().optional(),
  tags: z.string().optional(),
});

const deleteTaskWebhookBodySchema = z.object({
  syncId: z.string().min(1).trim(),
});

const authCallbackQuerySchema = z.object({
  code: z.string().min(1),
});

const fetchSyncQuerySchema = z.object({
  type: z.enum(['added', 'updated', 'deleted']),
});

const earlyAccessBodySchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type CreateTaskWebhookBody = z.infer<typeof createTaskWebhookBodySchema>;
export type UpdateTaskWebhookBody = z.infer<typeof updateTaskWebhookBodySchema>;
export type DeleteTaskWebhookBody = z.infer<typeof deleteTaskWebhookBodySchema>;
export type AuthCallbackQuery = z.infer<typeof authCallbackQuerySchema>;
export type FetchSyncQuery = z.infer<typeof fetchSyncQuerySchema>;
export type EarlyAccessBody = z.infer<typeof earlyAccessBodySchema>;

// --- ROUTES ---
app.get('/', handleLandingPage);

app.get(
  '/auth/google/callback',
  zValidator('query', authCallbackQuerySchema),
  handleGoogleCallback
);

app.post(
  '/webhook/:userId/tasks',
  zValidator('param', userIdParamSchema),
  zValidator('json', createTaskWebhookBodySchema),
  handleCreateTaskWebhook
);

app.put(
  '/webhook/:userId/tasks',
  zValidator('param', userIdParamSchema),
  zValidator('json', updateTaskWebhookBodySchema),
  handleUpdateTaskWebhook
);

app.delete(
  '/webhook/:userId/tasks',
  zValidator('param', userIdParamSchema),
  zValidator('json', deleteTaskWebhookBodySchema),
  handleDeleteTaskWebhook
);

app.get(
  '/sync/:userId',
  zValidator('param', userIdParamSchema),
  zValidator('query', fetchSyncQuerySchema),
  handleFetchSync
);

app.post(
  '/early-access',
  earlyAccessRateLimit,
  zValidator('json', earlyAccessBodySchema),
  handleEarlyAccess
);

// Admin routes (optional - for monitoring)
app.get('/admin/early-access', handleAdminEarlyAccess);
app.get('/admin/stats', handleAdminStats);

// --- Vercel Export ---
export default handle(app);
