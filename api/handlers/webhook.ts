import type { Context } from 'hono';
import { GoogleTasksService } from '../services/google-tasks';
import { UserService } from '../services/user';

export function createWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleWebhook(c: Context) {
    const { userId } = c.req.valid('param');
    console.log('Webhook called for userId:', userId);

    const payload = c.req.valid('json');
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
