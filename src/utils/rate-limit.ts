import type { Context } from 'hono';
import type { Redis } from '@upstash/redis';
import { SyncFlowError } from './errors';

export interface RateLimitOptions {
  /**
   * Time window in seconds
   */
  windowMs: number;
  /**
   * Maximum number of requests per window
   */
  max: number;
  /**
   * Key prefix for Redis storage
   */
  keyPrefix: string;
  /**
   * Custom key generator function
   */
  keyGenerator?: (c: Context) => string;
  /**
   * Message to return when rate limit is exceeded
   */
  message?: string;
}

export function createRateLimiter(redis: Redis, options: RateLimitOptions) {
  const {
    windowMs,
    max,
    keyPrefix,
    keyGenerator = (c: Context) =>
      c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown',
    message = 'Too many requests, please try again later.',
  } = options;

  return async function rateLimitMiddleware(
    c: Context,
    next: () => Promise<void>
  ) {
    try {
      const clientKey = keyGenerator(c);
      const redisKey = `${keyPrefix}:${clientKey}`;

      // Get current count
      const current = await redis.get(redisKey);
      const count = current ? Number(current) : 0;

      if (count >= max) {
        // Check if we should return the TTL for retry-after header
        const ttl = await redis.ttl(redisKey);

        throw new SyncFlowError(message, 'RATE_LIMIT_EXCEEDED', 429, {
          retryAfter: ttl > 0 ? ttl : windowMs,
          limit: max,
          remaining: 0,
        });
      }

      // Increment counter
      const newCount = await redis.incr(redisKey);

      // Set expiry on first request
      if (newCount === 1) {
        await redis.expire(redisKey, windowMs);
      }

      // Add rate limit headers
      c.res.headers.set('X-RateLimit-Limit', max.toString());
      c.res.headers.set(
        'X-RateLimit-Remaining',
        Math.max(0, max - newCount).toString()
      );

      // Continue to next middleware/handler
      await next();
    } catch (error) {
      if (error instanceof SyncFlowError) {
        throw error;
      }

      console.error('Rate limit middleware error:', error);
      // On Redis errors, allow the request to proceed
      await next();
    }
  };
}
