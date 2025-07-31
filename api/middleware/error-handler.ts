import type { Context, Next } from 'hono';
import { SyncFlowError } from '../utils/errors';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export async function errorHandler(c: Context, next: Next) {
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
}
