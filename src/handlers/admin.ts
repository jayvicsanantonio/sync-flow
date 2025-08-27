import type { Context } from 'hono';
import type { Redis } from '@upstash/redis';
import { SyncFlowError } from '../utils/errors';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function createAdminEarlyAccessHandler(redis: Redis) {
  return async function handleAdminEarlyAccess(c: Context) {
    try {
      // Simple auth check
      const auth = c.req.header('authorization');
      const token = auth?.replace('Bearer ', '');

      if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
        throw new SyncFlowError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      // Get all early access emails
      const emails = (await redis.smembers('early-access:list')) as string[];
      const count = ((await redis.get('early-access:count')) as number) || 0;

      // Get detailed info for each email
      const requests = await Promise.all(
        emails.map(async (email) => {
          const data = await redis.get(`early-access:${email}`);
          if (data) {
            try {
              return typeof data === 'string' ? JSON.parse(data) : data;
            } catch (parseError) {
              console.error(
                'Failed to parse early access data for email:',
                email,
                parseError
              );
              return null;
            }
          }
          return null;
        })
      );

      const validRequests = requests.filter(Boolean);

      return c.json({
        summary: {
          totalRequests: count,
          uniqueEmails: emails.length,
        },
        requests: validRequests,
      });
    } catch (error) {
      if (error instanceof SyncFlowError) {
        throw error;
      }

      console.error('Admin early access error:', error);
      throw new SyncFlowError(
        'Failed to fetch early access data',
        'ADMIN_ERROR',
        500,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  };
}

export function createAdminStatsHandler(redis: Redis) {
  return async function handleAdminStats(c: Context) {
    try {
      // Simple auth check
      const auth = c.req.header('authorization');
      const token = auth?.replace('Bearer ', '');

      if (!ADMIN_SECRET || token !== ADMIN_SECRET) {
        throw new SyncFlowError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      // Get basic stats
      const earlyAccessCount =
        ((await redis.get('early-access:count')) as number) || 0;
      const earlyAccessEmails = (await redis.smembers(
        'early-access:list'
      )) as string[];

      // Get recent requests (last 24 hours)
      const yesterday = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const recentRequests = await Promise.all(
        earlyAccessEmails.map(async (email) => {
          const data = await redis.get(`early-access:${email}`);
          if (data) {
            try {
              const parsedData =
                typeof data === 'string' ? JSON.parse(data) : data;
              if (
                parsedData &&
                typeof parsedData === 'object' &&
                'timestamp' in parsedData
              ) {
                return (parsedData as { timestamp: string }).timestamp >=
                  yesterday
                  ? parsedData
                  : null;
              }
            } catch (parseError) {
              console.error(
                'Failed to parse early access data for email:',
                email,
                parseError
              );
            }
          }
          return null;
        })
      );

      const recentCount = recentRequests.filter(Boolean).length;

      return c.json({
        earlyAccess: {
          total: earlyAccessCount,
          unique: earlyAccessEmails.length,
          last24Hours: recentCount,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof SyncFlowError) {
        throw error;
      }

      console.error('Admin stats error:', error);
      throw new SyncFlowError(
        'Failed to fetch admin stats',
        'ADMIN_ERROR',
        500,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  };
}
