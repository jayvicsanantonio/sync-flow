import type { Context, Next } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export async function corsHandler(c: Context, next: Next) {
  c.header('Access-Control-Allow-Origin', '*');
  c.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  c.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  c.header('Access-Control-Max-Age', '86400');

  if (c.req.method === 'OPTIONS') {
    return c.text('', 204 as ContentfulStatusCode);
  }

  await next();
}
