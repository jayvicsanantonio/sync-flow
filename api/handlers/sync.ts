import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type { GoogleTask } from '../types/google-api';
import type { UserIdParam } from '../index';

export function createSyncHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleFetchUpdates(
    c: Context<any, any, { out: { param: UserIdParam } }>
  ) {
    const { userId } = c.req.valid('param');

    try {
      const accessToken = await userService.getAccessToken(userId);

      const user = await userService.getUserById(userId);
      if (!user) {
        return c.json({ error: 'User not found.' }, 404);
      }

      const lastSyncTime = user.lastSyncTime || new Date(0).toISOString();

      const response = await googleTasksService.listTasks(accessToken, {
        showCompleted: false,
        showHidden: false,
        updatedMin: lastSyncTime,
        maxResults: 100,
      });

      const allTasks = response.items || [];
      const newTasks = allTasks.filter(
        (task: GoogleTask) => !user.syncedTaskIds.includes(task.id)
      );

      if (newTasks.length > 0) {
        const newTaskIds = newTasks.map((task: GoogleTask) => task.id);
        await userService.updateSyncedTaskIds(userId, newTaskIds);
      }

      await userService.updateLastSyncTime(userId, new Date().toISOString());

      return c.json({
        tasks: newTasks,
        hasMore: !!response.nextPageToken,
        syncedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Fetch-updates error:', error);

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

      return c.json({ error: 'Failed to fetch tasks from Google.' }, 500);
    }
  };
}
