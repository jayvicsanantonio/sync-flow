import type { Context } from 'hono';
import { GoogleTasksService } from '../services/google-tasks';
import { UserService } from '../services/user';

export function createWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleWebhook(c: Context) {
    const userId = c.req.param('userId');
    console.log('Webhook called for userId:', userId);

    const { title, notes, due } = await c.req.json();
    console.log('Webhook payload:', { title, notes, due });

    try {
      const task = await userService.callGoogleAPIWithRefresh(
        userId,
        (accessToken) =>
          googleTasksService.createTask(accessToken, title, notes, due)
      );
      return c.json({ message: 'Task created.', taskId: task.id }, 201);
    } catch (error) {
      console.error('Webhook error:', error);

      if (
        error instanceof Error &&
        error.message.includes('User needs to re-authenticate')
      ) {
        return c.json(
          {
            error: 'Authentication expired. Please re-authorize the app.',
          },
          401
        );
      }

      return c.json({ error: 'Failed to create task in Google.' }, 500);
    }
  };
} 