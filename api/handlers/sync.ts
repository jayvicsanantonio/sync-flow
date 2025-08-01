import type { Context } from 'hono';
import { GoogleTasksService } from '../services/google-tasks';
import { UserService } from '../services/user';
import type { GoogleTask } from '../types/google-api';

export function createSyncHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleFetchUpdates(c: Context) {
    const { userId } = c.req.valid('param');

    try {
      const accessToken = await userService.getAccessToken(userId);
      const response = await googleTasksService.listTasks(
        accessToken
      );

      const user = await userService.getUserById(userId);

      if (!user) {
        return c.json(
          { error: 'User not found after API call.' },
          404
        );
      }

      const allTasks = response.items || [];
      const newTasks = allTasks.filter(
        (task: GoogleTask) => !user.syncedTaskIds.includes(task.id)
      );

      if (newTasks.length > 0) {
        const newTaskIds = newTasks.map(
          (task: GoogleTask) => task.id
        );
        await userService.updateSyncedTaskIds(userId, newTaskIds);
      }

      return c.json(newTasks);
    } catch (error) {
      console.error('Fetch-updates error:', error);

      if (
        error instanceof Error &&
        error.message.includes('User needs to re-authenticate')
      ) {
        return c.json(
          {
            error:
              'Authentication expired. Please re-authorize the app.',
          },
          401
        );
      }

      return c.json(
        { error: 'Failed to fetch tasks from Google.' },
        500
      );
    }
  };
}
