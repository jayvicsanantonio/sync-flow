import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { handle } from 'hono/vercel';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { SyncFlowError } from './utils/errors';
import { Redis } from '@upstash/redis';
import { GoogleAuthService } from './services/google-auth';
import { GoogleTasksService } from './services/google-tasks';
import { UserService } from './services/user';
import { createHomeHandler } from './handlers/home';
import { createAuthHandler } from './handlers/auth';
import {
  createWebhookHandler,
  createCreateTaskWebhookHandler,
  createUpdateTaskWebhookHandler,
  createDeleteTaskWebhookHandler,
} from './handlers/webhook';
import { createSyncHandler } from './handlers/sync';

const redis = Redis.fromEnv();

const googleAuthService = new GoogleAuthService();
const googleTasksService = new GoogleTasksService();
const userService = new UserService(redis, googleAuthService);

const handleHome = createHomeHandler(googleAuthService);
const handleGoogleCallback = createAuthHandler(googleAuthService, userService);
const handleWebhook = createWebhookHandler(googleTasksService, userService);
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
const handleFetchUpdates = createSyncHandler(googleTasksService, userService);

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
  starred: z.boolean().optional(),
  parent: z.string().trim().optional(),
});

const createTaskWebhookBodySchema = z.object({
  title: z.string().min(1).trim(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  starred: z.boolean().optional(),
  parent: z.string().trim().optional(),
});

const updateTaskWebhookBodySchema = z.object({
  taskId: z.string().min(1).trim(),
  title: z.string().min(1).trim().optional(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  status: z.enum(['needsAction', 'completed']).optional(),
  starred: z.boolean().optional(),
  parent: z.string().trim().optional(),
});

const deleteTaskWebhookBodySchema = z.object({
  taskId: z.string().min(1).trim(),
});

const authCallbackQuerySchema = z.object({
  code: z.string().min(1),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type WebhookBody = z.infer<typeof webhookBodySchema>;
export type CreateTaskWebhookBody = z.infer<typeof createTaskWebhookBodySchema>;
export type UpdateTaskWebhookBody = z.infer<typeof updateTaskWebhookBodySchema>;
export type DeleteTaskWebhookBody = z.infer<typeof deleteTaskWebhookBodySchema>;
export type AuthCallbackQuery = z.infer<typeof authCallbackQuerySchema>;

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
  '/fetch-updates/:userId',
  zValidator('param', userIdParamSchema),
  handleFetchUpdates
);

// --- Vercel Export ---
export default handle(app);
