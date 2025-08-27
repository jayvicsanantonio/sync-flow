import type { Context } from 'hono';
import type { Redis } from '@upstash/redis';
import { SyncFlowError } from '../utils/errors';
import { sendBetaRequestEmail } from '../services/email';

export interface EarlyAccessRequest {
  email: string;
  timestamp: string;
  userAgent?: string;
  ip?: string;
}

export function createEarlyAccessHandler(redis: Redis) {
  return async function handleEarlyAccess(c: Context) {
    try {
      // Get email from validated request body
      const body = (await c.req.json()) as { email: string };
      const email = body.email;

      // Check if email is already registered
      const existingEntry = await redis.get(`early-access:${email}`);
      if (existingEntry) {
        return c.json({
          success: true,
          message: "You're already on the list! We'll be in touch soon.",
        });
      }

      // Create early access request object
      const earlyAccessRequest: EarlyAccessRequest = {
        email,
        timestamp: new Date().toISOString(),
        userAgent: c.req.header('user-agent'),
        ip:
          c.req.header('x-forwarded-for') ||
          c.req.header('x-real-ip') ||
          'unknown',
      };

      // Store in Redis with email as key (explicit JSON serialization for consistency)
      await redis.set(
        `early-access:${email}`,
        JSON.stringify(earlyAccessRequest)
      );

      // Add to the early access list (for easy retrieval of all emails)
      await redis.sadd('early-access:list', email);

      // Increment counter for analytics
      await redis.incr('early-access:count');

      // Send email notification to owner (don't let email failures break user flow)
      try {
        const emailResult = await sendBetaRequestEmail(earlyAccessRequest);
        if (emailResult.success) {
          console.log('Beta access email sent successfully:', {
            emailId: emailResult.id,
            userEmail: email,
          });
        } else {
          console.error('Failed to send beta access email:', {
            error: emailResult.error,
            userEmail: email,
          });
        }
      } catch (emailError) {
        console.error('Email notification failed:', {
          error: emailError instanceof Error ? emailError.message : emailError,
          userEmail: email,
        });
      }

      // Log the request for monitoring
      console.log('New early access request:', {
        email,
        timestamp: earlyAccessRequest.timestamp,
        userAgent: earlyAccessRequest.userAgent,
        ip: earlyAccessRequest.ip,
      });

      return c.json({
        success: true,
        message:
          "Thanks for your interest! You'll be among the first to know when beta access is available.",
      });
    } catch (error) {
      console.error('Early access submission error:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new SyncFlowError(
        'Failed to process early access request',
        'EARLY_ACCESS_ERROR',
        500,
        {
          originalError: error instanceof Error ? error.message : String(error),
        }
      );
    }
  };
}
