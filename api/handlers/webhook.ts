import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type { UpdateTaskRequest } from '../types/google-api';
import type {
  CreateTaskWebhookBody,
  UpdateTaskWebhookBody,
  DeleteTaskWebhookBody,
  UserIdParam,
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
        payload.due,
        payload.priority,
        payload.isFlagged,
        payload.url,
        payload.tags
      );

      return c.json(
        {
          message: 'Task created successfully.',
          taskId: task.id,
          task,
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
      { out: { param: UserIdParam; json: UpdateTaskWebhookBody } }
    >
  ) {
    const { userId } = c.req.valid('param');
    const payload = c.req.valid('json');

    console.log('Updating task for userId:', userId);
    console.log('Update payload:', payload);

    try {
      const accessToken = await userService.getAccessToken(userId);

      const updates: UpdateTaskRequest = {};
      if (payload.title !== undefined) updates.title = payload.title;
      if (payload.notes !== undefined) updates.notes = payload.notes;
      if (payload.due !== undefined) updates.due = payload.due;
      if (payload.status !== undefined) updates.status = payload.status;
      if (payload.priority !== undefined) updates.priority = payload.priority;
      if (payload.isFlagged !== undefined)
        updates.isFlagged = payload.isFlagged;
      if (payload.url !== undefined) updates.url = payload.url;
      if (payload.tags !== undefined) updates.tags = payload.tags;

      const task = await googleTasksService.updateTask(
        accessToken,
        payload.taskId,
        updates
      );
      return c.json(
        {
          message: 'Task updated successfully.',
          taskId: task.id,
          task,
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
    c: Context<
      any,
      any,
      { out: { param: UserIdParam; json: DeleteTaskWebhookBody } }
    >
  ) {
    const { userId } = c.req.valid('param');
    const { taskId } = c.req.valid('json');

    console.log('Deleting task:', { userId, taskId });

    try {
      const accessToken = await userService.getAccessToken(userId);

      await googleTasksService.deleteTask(accessToken, taskId);

      return c.json(
        {
          message: 'Task deleted successfully.',
          taskId,
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
