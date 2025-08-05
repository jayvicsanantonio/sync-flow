import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type { GoogleTask } from '../types/google-api';
import type { UserIdParam } from '../index';
import { NotFoundError } from '../utils/errors';

export function createSyncHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleFetchUpdates(
    c: Context<any, any, { out: { param: UserIdParam } }>
  ) {
    const { userId } = c.req.valid('param');

    console.log('Fetching updates for userId:', userId);

    try {
      const accessToken = await userService.getAccessToken(userId);
      const user = await userService.getUserById(userId);

      if (!user) {
        throw new NotFoundError('User');
      }

      const lastSyncTime = user.lastSyncTime || new Date(0).toISOString();
      const allTasks = await googleTasksService.listAllTasks(accessToken, {
        showCompleted: false,
        showHidden: false,
        updatedMin: lastSyncTime,
      });

      await handleTaskUpdates(
        userId,
        new Set(user.syncedTaskIds),
        allTasks,
        userService
      );

      const syncedAt = new Date().toISOString();
      await userService.updateLastSyncTime(userId, syncedAt);

      return c.json(
        {
          message: 'Tasks fetched successfully.',
          syncedAt,
          tasks: allTasks,
        },
        200
      );
    } catch (error) {
      console.error('Error fetching updates:', error);
      throw error;
    }
  };
}

async function handleTaskUpdates(
  userId: string,
  syncedTaskIds: Set<string>,
  tasks: GoogleTask[],
  userService: UserService
) {
  const newTasks = tasks.filter((task) => !syncedTaskIds.has(task.id));

  if (newTasks.length > 0) {
    const newTaskIds = newTasks.map((task) => task.id);
    await userService.updateSyncedTaskIds(userId, newTaskIds);
  }
}
