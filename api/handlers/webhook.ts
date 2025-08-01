import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type {
  CreateTaskWebhookBody,
  UpdateTaskWebhookBody,
  UserIdParam,
  UserIdWithTaskIdParam,
} from '../index';

export function createCreateTaskWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleCreateTask(
    c: Context<
      any,
      any,
      { out: { param: UserIdParam; json: CreateTaskWebhookBody } }
    >
  ) {
    const { userId } = c.req.valid('param');
    const payload = c.req.valid('json');

    console.log('Creating task for userId:', userId);
    console.log('Create payload:', payload);

    try {
      const accessToken = await userService.getAccessToken(userId);
      const task = await googleTasksService.createTask(
        accessToken,
        payload.title,
        payload.notes,
        payload.due
      );

      return c.json(
        {
          message: 'Task created successfully.',
          taskId: task.id,
          task: task,
        },
        201
      );
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  };
}

export function createUpdateTaskWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleUpdateTask(
    c: Context<
      any,
      any,
      { out: { param: UserIdWithTaskIdParam; json: UpdateTaskWebhookBody } }
    >
  ) {
    const { userId, taskId } = c.req.valid('param');
    const payload = c.req.valid('json');

    console.log('Updating task:', { userId, taskId });
    console.log('Update payload:', payload);

    try {
      const accessToken = await userService.getAccessToken(userId);

      // TODO: Implement updateTask in GoogleTasksService
      // const task = await googleTasksService.updateTask(
      //   accessToken,
      //   taskId,
      //   payload.title,
      //   payload.notes,
      //   payload.due,
      //   payload.status
      // );

      // Temporary response until updateTask is implemented
      return c.json(
        {
          message: 'Task update endpoint ready (implementation pending).',
          taskId: taskId,
          updatedFields: payload,
        },
        200
      );
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };
}

export function createDeleteTaskWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleDeleteTask(
    c: Context<any, any, { out: { param: UserIdWithTaskIdParam } }>
  ) {
    const { userId, taskId } = c.req.valid('param');

    console.log('Deleting task:', { userId, taskId });

    try {
      const accessToken = await userService.getAccessToken(userId);

      // TODO: Implement deleteTask in GoogleTasksService
      // await googleTasksService.deleteTask(accessToken, taskId);

      // Temporary response until deleteTask is implemented
      return c.json(
        {
          message: 'Task delete endpoint ready (implementation pending).',
          taskId: taskId,
          deleted: true,
        },
        200
      );
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  };
}

export function createWebhookHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return createCreateTaskWebhookHandler(googleTasksService, userService);
}
