import type { Context } from 'hono';
import type { GoogleTasksService } from '../services/google-tasks';
import type { UserService } from '../services/user';
import type { GoogleTask } from '../types/google-api';
import type { UserIdParam, FetchSyncQuery } from '../index';
import { NotFoundError } from '../utils/errors';

interface TaskWithSyncId extends GoogleTask {
  syncId?: string;
}

interface SyncSnapshot {
  taskIds: string[];
  taskDetails: Record<string, { syncId: string; updated: string }>;
  timestamp: string;
}

/**
 * Unified handler for fetching sync updates based on query type
 */
export function createFetchSyncHandler(
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  return async function handleFetchSync(
    c: Context<any, any, { out: { param: UserIdParam; query: FetchSyncQuery } }>
  ) {
    const { userId } = c.req.valid('param');
    const { type } = c.req.valid('query');

    console.log(`Fetching ${type} tasks for userId:`, userId);

    try {
      const accessToken = await userService.getAccessToken(userId);
      const user = await userService.getUserById(userId);

      if (!user) {
        throw new NotFoundError('User');
      }

      switch (type) {
        case 'added':
          return await handleFetchAdded(
            c,
            userId,
            accessToken,
            googleTasksService,
            userService
          );
        case 'updated':
          return await handleFetchUpdated(
            c,
            userId,
            accessToken,
            googleTasksService,
            userService
          );
        case 'deleted':
          return await handleFetchDeleted(
            c,
            userId,
            accessToken,
            googleTasksService,
            userService
          );
        default:
          return c.json({ error: 'Invalid type parameter' }, 400);
      }
    } catch (error) {
      console.error(`Error fetching ${type} tasks:`, error);
      throw error;
    }
  };
}

/**
 * Fetches tasks that have been added to Google Tasks since last sync
 */
async function handleFetchAdded(
  c: Context,
  userId: string,
  accessToken: string,
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  // Get last sync snapshot
  const lastSnapshot = await userService.getLastSyncSnapshot(userId);
  const knownTaskIds = new Set(lastSnapshot?.taskIds || []);

  // Fetch all current tasks from Google
  const allTasks = await googleTasksService.listAllTasks(accessToken, {
    showCompleted: false,
    showHidden: false,
  });

  // Find tasks that are new (not in our last snapshot)
  const addedTasks: TaskWithSyncId[] = [];

  for (const task of allTasks) {
    if (!knownTaskIds.has(task.id)) {
      // Check if this task has a syncId in its metadata
      const metadata = googleTasksService.extractTaskMetadata(task);
      const syncId = metadata.syncId;

      // Only include tasks that have a syncId (created through our sync system)
      if (syncId) {
        addedTasks.push({
          ...task,
          syncId,
        });
      }
    }
  }

  // Update sync snapshot
  await updateSyncSnapshot(userId, allTasks, userService);

  return c.json(
    {
      tasks: addedTasks,
      count: addedTasks.length,
      syncedAt: new Date().toISOString(),
    },
    200
  );
}

/**
 * Fetches tasks that have been updated in Google Tasks since last sync
 */
async function handleFetchUpdated(
  c: Context,
  userId: string,
  accessToken: string,
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  // Get last sync snapshot
  const lastSnapshot = await userService.getLastSyncSnapshot(userId);
  if (!lastSnapshot) {
    // No previous sync, so no updates possible
    return c.json(
      {
        tasks: [],
        count: 0,
        syncedAt: new Date().toISOString(),
      },
      200
    );
  }

  // Fetch all tasks once for both updated task detection and snapshot update
  const allTasks = await googleTasksService.listAllTasks(accessToken, {
    showCompleted: false,
    showHidden: false,
  });

  const updatedTasks: TaskWithSyncId[] = [];

  for (const task of allTasks) {
    const lastTaskData = lastSnapshot.taskDetails[task.id];

    // Task exists in snapshot and has been updated since last sync
    if (
      lastTaskData &&
      task.updated > lastTaskData.updated &&
      task.updated >= lastSnapshot.timestamp
    ) {
      const metadata = googleTasksService.extractTaskMetadata(task);
      const syncId = metadata.syncId || lastTaskData.syncId;

      updatedTasks.push({
        ...task,
        syncId,
      });
    }
  }

  // Update sync snapshot using the already fetched tasks
  await updateSyncSnapshot(userId, allTasks, userService);

  return c.json(
    {
      tasks: updatedTasks,
      count: updatedTasks.length,
      syncedAt: new Date().toISOString(),
    },
    200
  );
}

/**
 * Fetches tasks that have been deleted from Google Tasks since last sync
 */
async function handleFetchDeleted(
  c: Context,
  userId: string,
  accessToken: string,
  googleTasksService: GoogleTasksService,
  userService: UserService
) {
  // Get last sync snapshot
  const lastSnapshot = await userService.getLastSyncSnapshot(userId);
  if (!lastSnapshot) {
    // No previous sync, so no deletions possible
    return c.json(
      {
        syncIds: [],
        count: 0,
        syncedAt: new Date().toISOString(),
      },
      200
    );
  }

  // Fetch all current tasks from Google
  const allTasks = await googleTasksService.listAllTasks(accessToken, {
    showCompleted: false,
    showHidden: false,
  });

  const currentTaskIds = new Set(allTasks.map((task) => task.id));
  const deletedSyncIds: string[] = [];
  const deletionPromises: Promise<void>[] = [];

  // Find tasks that were in the snapshot but are no longer present
  for (const [taskId, taskData] of Object.entries(lastSnapshot.taskDetails)) {
    if (!currentTaskIds.has(taskId)) {
      deletedSyncIds.push(taskData.syncId);
      // Collect deletion promises for parallel execution
      deletionPromises.push(
        userService.deleteTaskMapping(userId, taskData.syncId, taskId)
      );
    }
  }

  // Execute all deletion operations in parallel
  await Promise.all(deletionPromises);

  // Update sync snapshot
  await updateSyncSnapshot(userId, allTasks, userService);

  return c.json(
    {
      syncIds: deletedSyncIds,
      count: deletedSyncIds.length,
      syncedAt: new Date().toISOString(),
    },
    200
  );
}

/**
 * Updates the sync snapshot with current state of tasks
 */
async function updateSyncSnapshot(
  userId: string,
  tasks: GoogleTask[],
  userService: UserService
): Promise<void> {
  const snapshot: SyncSnapshot = {
    taskIds: [],
    taskDetails: {},
    timestamp: new Date().toISOString(),
  };

  // Create promises for all database lookups in parallel
  const taskProcessingPromises = tasks.map(async (task) => {
    const metadata =
      userService.googleTasksService?.extractTaskMetadata(task) || {};

    // Only make database call if syncId is not already in metadata
    const syncId =
      metadata.syncId ||
      (await userService.getSyncIdByGoogleTaskId(userId, task.id)) ||
      '';

    return {
      taskId: task.id,
      syncId,
      updated: task.updated,
    };
  });

  // Execute all database lookups in parallel
  const processedTasks = await Promise.all(taskProcessingPromises);

  // Build the snapshot from the processed results
  for (const processedTask of processedTasks) {
    snapshot.taskIds.push(processedTask.taskId);
    snapshot.taskDetails[processedTask.taskId] = {
      syncId: processedTask.syncId,
      updated: processedTask.updated,
    };
  }

  await userService.saveLastSyncSnapshot(userId, snapshot);
}
