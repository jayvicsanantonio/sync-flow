import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type {
  CreateTaskWebhookBody,
  UpdateTaskWebhookBody,
  DeleteTaskWebhookBody,
  UserIdParam,
} from '../../api/index';

/**
 * Parses various date formats and returns RFC 3339 format
 * @param dateString - The date string to parse
 * @returns RFC 3339 formatted date string or undefined if parsing fails
 */
function parseToRFC3339(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      console.warn(`Failed to parse date: ${dateString}`);
      return undefined;
    }

    return date.toISOString();
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return undefined;
  }
}

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
    const syncId = payload.syncId || `sync_${Date.now()}`;

    try {
      const accessToken = await userService.getAccessToken(userId);
      const task = await googleTasksService.createTask(
        accessToken,
        payload.title,
        payload.notes,
        parseToRFC3339(payload.due),
        payload.priority,
        payload.url,
        payload.tags,
        syncId
      );

      await userService.saveTaskMapping(userId, syncId, task.id);

      return c.json(
        {
          message: 'Task created successfully.',
          taskId: task.id,
          syncId,
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
    const syncId = payload.syncId;

    console.log('Updating task for userId:', userId);
    console.log('Update payload:', payload);

    try {
      const accessToken = await userService.getAccessToken(userId);

      const taskId = await userService.getGoogleTaskIdBySyncId(userId, syncId);

      if (!taskId) {
        return c.json({ error: 'Task not found for provided syncId.' }, 404);
      }

      const task = await googleTasksService.updateTask(
        accessToken,
        taskId,
        payload
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
    const payload = c.req.valid('json');
    const { syncId } = payload;

    console.log('Deleting task:', { userId, syncId });

    try {
      const accessToken = await userService.getAccessToken(userId);

      const taskId = await userService.getGoogleTaskIdBySyncId(userId, syncId);

      if (!taskId) {
        return c.json({ error: 'Task not found for provided syncId.' }, 404);
      }

      await googleTasksService.deleteTask(accessToken, taskId);
      await userService.deleteTaskMapping(userId, syncId, taskId);

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
