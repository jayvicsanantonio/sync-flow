import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type { WebhookBody, UserIdParam } from '../index';

export function createWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleWebhook(
    c: Context<any, any, { out: { param: UserIdParam; json: WebhookBody } }>
  ) {
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
