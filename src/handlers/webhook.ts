import type { Context } from 'hono';
import { GoogleTasksService } from '@/services/google-tasks';
import { UserService } from '@/services/user';
import {
  validateWebhookPayload,
  validateUserId,
} from '@/utils/validation';

export function createWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleWebhook(c: Context) {
    const userId = validateUserId(c.req.param('userId'));
    console.log('Webhook called for userId:', userId);

    const rawPayload = await c.req.json();
    const payload = validateWebhookPayload(rawPayload);
    console.log('Webhook payload:', payload);

    const accessToken = await userService.getAccessToken(userId);
    const task = await googleTasksService.createTask(
      accessToken,
      payload.title,
      payload.notes,
      payload.due
    );

    return c.json(
      { message: 'Task created successfully.', taskId: task.id },
      201
    );
  };
}
