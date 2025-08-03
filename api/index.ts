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

const createTaskWebhookBodySchema = z.object({
  title: z.string().min(1).trim(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  priority: z.string().optional(),
  isFlagged: z.boolean().optional(),
  url: z.string().url().optional(),
  tags: z.string().optional(),
});

const updateTaskWebhookBodySchema = z.object({
  taskId: z.string().min(1).trim(),
  title: z.string().min(1).trim().optional(),
  notes: z.string().trim().optional(),
  due: z.string().optional(),
  status: z.enum(['needsAction', 'completed']).optional(),
  priority: z.string().optional(),
  isFlagged: z.boolean().optional(),
  url: z.string().url().optional(),
  tags: z.string().optional(),
});

const deleteTaskWebhookBodySchema = z.object({
  taskId: z.string().min(1).trim(),
});

const authCallbackQuerySchema = z.object({
  code: z.string().min(1),
});

export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type CreateTaskWebhookBody = z.infer<typeof createTaskWebhookBodySchema>;
export type UpdateTaskWebhookBody = z.infer<typeof updateTaskWebhookBodySchema>;
export type DeleteTaskWebhookBody = z.infer<typeof deleteTaskWebhookBodySchema>;
export type AuthCallbackQuery = z.infer<typeof authCallbackQuerySchema>;

// --- ROUTES ---
app.get('/', handleHome);

app.get(
  '/auth/google/callback',
  async (c, next) => {
    console.log('Pre-validation - GET /auth/google/callback:', {
      query: c.req.query(),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    });
    await next();
  },
  zValidator('query', authCallbackQuerySchema),
  async (c, next) => {
    console.log('Post-validation - GET /auth/google/callback:', {
      validatedQuery: c.req.valid('query'),
    });
    await next();
  },
  handleGoogleCallback
);

app.post(
  '/webhook/:userId/tasks',
  async (c, next) => {
    console.log('Pre-validation - POST /webhook/:userId/tasks:', {
      params: c.req.param(),
      body: await c.req.json().catch(() => 'Unable to parse body'),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    });
    await next();
  },
  zValidator('param', userIdParamSchema),
  zValidator('json', createTaskWebhookBodySchema),
  async (c, next) => {
    console.log('Post-validation - POST /webhook/:userId/tasks:', {
      validatedParams: c.req.valid('param'),
      validatedBody: c.req.valid('json'),
    });
    await next();
  },
  handleCreateTaskWebhook
);

app.put(
  '/webhook/:userId/tasks',
  async (c, next) => {
    console.log('Pre-validation - PUT /webhook/:userId/tasks:', {
      params: c.req.param(),
      body: await c.req.json().catch(() => 'Unable to parse body'),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    });
    await next();
  },
  zValidator('param', userIdParamSchema),
  zValidator('json', updateTaskWebhookBodySchema),
  async (c, next) => {
    console.log('Post-validation - PUT /webhook/:userId/tasks:', {
      validatedParams: c.req.valid('param'),
      validatedBody: c.req.valid('json'),
    });
    await next();
  },
  handleUpdateTaskWebhook
);

app.delete(
  '/webhook/:userId/tasks',
  async (c, next) => {
    console.log('Pre-validation - DELETE /webhook/:userId/tasks:', {
      params: c.req.param(),
      body: await c.req.json().catch(() => 'Unable to parse body'),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    });
    await next();
  },
  zValidator('param', userIdParamSchema),
  zValidator('json', deleteTaskWebhookBodySchema),
  async (c, next) => {
    console.log('Post-validation - DELETE /webhook/:userId/tasks:', {
      validatedParams: c.req.valid('param'),
      validatedBody: c.req.valid('json'),
    });
    await next();
  },
  handleDeleteTaskWebhook
);

app.get(
  '/fetch-updates/:userId',
  async (c, next) => {
    console.log('Pre-validation - GET /fetch-updates/:userId:', {
      params: c.req.param(),
      headers: {
        'user-agent': c.req.header('user-agent'),
        'content-type': c.req.header('content-type'),
      },
    });
    await next();
  },
  zValidator('param', userIdParamSchema),
  async (c, next) => {
    console.log('Post-validation - GET /fetch-updates/:userId:', {
      validatedParams: c.req.valid('param'),
    });
    await next();
  },
  handleFetchUpdates
);

// --- Vercel Export ---
export default handle(app);
