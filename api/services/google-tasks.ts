import type {
  GoogleTask,
  GoogleTasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../types/google-api';

const TASKS_API_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';
const DEFAULT_TASK_LIST = '@default';
const MAX_PAGE_SIZE = 100;

interface TaskMetadata {
  priority?: string;
  isFlagged?: boolean;
  url?: string;
  tags?: string;
}

/**
 * Builds the final notes string with metadata appended in a structured format
 * @param notes - The original notes content
 * @param metadata - The metadata to append
 * @returns The final notes string with metadata section
 */
function buildNotesWithMetadata(
  notes: string | undefined,
  metadata: TaskMetadata
): string {
  let finalNotes = notes || '';
  const metadataLines: string[] = [];

  if (metadata.priority !== undefined) {
    metadataLines.push(`Priority: ${metadata.priority}`);
  }

  if (metadata.isFlagged !== undefined) {
    metadataLines.push(`Flagged: ${metadata.isFlagged ? 'Yes' : 'No'}`);
  }

  if (metadata.url) {
    metadataLines.push(`URL: ${metadata.url}`);
  }

  if (metadata.tags) {
    metadataLines.push(`Tags: ${metadata.tags}`);
  }

  if (metadataLines.length > 0) {
    const metadataSection = metadataLines.join('\n');
    finalNotes = finalNotes
      ? `${finalNotes}\n\n--- Metadata ---\n${metadataSection}`
      : `--- Metadata ---\n${metadataSection}`;
  }

  return finalNotes;
}

/**
 * Extracts metadata from notes that were formatted with buildNotesWithMetadata
 * @param notes - The notes string containing metadata
 * @returns The extracted metadata and the original notes without metadata
 */
function extractMetadataFromNotes(notes: string): {
  originalNotes: string;
  metadata: TaskMetadata;
} {
  const metadataMarker = '--- Metadata ---';
  const metadataIndex = notes.lastIndexOf(metadataMarker);

  if (metadataIndex === -1) {
    return { originalNotes: notes, metadata: {} };
  }

  const originalNotes = notes.substring(0, metadataIndex).trim();
  const metadataSection = notes
    .substring(metadataIndex + metadataMarker.length)
    .trim();

  const metadata: TaskMetadata = {};
  const lines = metadataSection.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    const separatorIndex = trimmedLine.indexOf(':');

    if (separatorIndex === -1) continue;

    const key = trimmedLine.substring(0, separatorIndex).trim();
    const value = trimmedLine.substring(separatorIndex + 1).trim();

    switch (key) {
      case 'Priority': {
        metadata.priority = value;
        break;
      }
      case 'Flagged':
        metadata.isFlagged = value === 'Yes';
        break;
      case 'URL':
        metadata.url = value;
        break;
      case 'Tags':
        metadata.tags = value;
        break;
    }
  }

  return { originalNotes, metadata };
}

export class GoogleTasksService {
  async createTask(
    accessToken: string,
    title: string,
    notes?: string,
    due?: string,
    priority?: string,
    isFlagged?: boolean,
    url?: string,
    tags?: string
  ): Promise<GoogleTask> {
    const taskData: CreateTaskRequest = {
      title: title || 'New Reminder',
    };

    const finalNotes = buildNotesWithMetadata(notes, {
      priority,
      isFlagged,
      url,
      tags,
    });

    if (finalNotes) taskData.notes = finalNotes;
    if (due) taskData.due = due;

    const requestUrl = new URL(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks`
    );

    console.log('🔵 Google Tasks API Request (createTask):', {
      url: requestUrl.toString(),
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
        'Content-Type': 'application/json',
      },
      body: taskData,
    });

    const response = await fetch(requestUrl.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (createTask):', {
        url: requestUrl.toString(),
        status: response.status,
        statusText: response.statusText,
        requestData: taskData,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to create task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const createdTask = await response.json();
    console.log('🟢 Google Tasks API Response (createTask):', {
      url: requestUrl.toString(),
      status: response.status,
      data: { id: createdTask.id, title: createdTask.title },
    });

    return createdTask;
  }

  async listTasks(
    accessToken: string,
    options?: {
      showCompleted?: boolean;
      showHidden?: boolean;
      showDeleted?: boolean;
      updatedMin?: string; // RFC 3339 timestamp
      maxResults?: number;
      pageToken?: string;
    }
  ): Promise<GoogleTasksListResponse> {
    const url = new URL(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks`
    );

    url.searchParams.set(
      'showCompleted',
      String(options?.showCompleted ?? false)
    );
    url.searchParams.set('showHidden', String(options?.showHidden ?? false));

    if (options?.showDeleted !== undefined) {
      url.searchParams.set('showDeleted', String(options.showDeleted));
    }

    if (options?.updatedMin) {
      url.searchParams.set('updatedMin', options.updatedMin);
    }

    if (options?.maxResults) {
      url.searchParams.set(
        'maxResults',
        String(Math.min(options.maxResults, MAX_PAGE_SIZE))
      );
    }

    if (options?.pageToken) {
      url.searchParams.set('pageToken', options.pageToken);
    }

    console.log('🔵 Google Tasks API Request (listTasks):', {
      url: url.toString(),
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
      },
      params: options,
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (listTasks):', {
        url: url.toString(),
        status: response.status,
        statusText: response.statusText,
        queryParams: options,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const tasksList = await response.json();
    console.log('🟢 Google Tasks API Response (listTasks):', {
      url: url.toString(),
      status: response.status,
      data: {
        totalItems: tasksList.items?.length || 0,
        hasNextPage: !!tasksList.nextPageToken,
      },
    });

    return tasksList;
  }
  async updateTask(
    accessToken: string,
    taskId: string,
    updates: UpdateTaskRequest,
    etag?: string
  ): Promise<GoogleTask> {
    const taskData: UpdateTaskRequest = {};

    if (updates.title !== undefined) taskData.title = updates.title;

    const hasMetadata =
      updates.priority !== undefined ||
      updates.isFlagged !== undefined ||
      updates.url !== undefined ||
      updates.tags !== undefined;

    if (updates.notes !== undefined || hasMetadata) {
      let finalNotes = updates.notes;
      let finalMetadata: TaskMetadata = {
        priority: updates.priority,
        isFlagged: updates.isFlagged,
        url: updates.url,
        tags: updates.tags,
      };

      if (hasMetadata && updates.notes === undefined) {
        const existingTask = await this.getTask(accessToken, taskId);
        if (existingTask.notes) {
          const { originalNotes, metadata: existingMetadata } =
            extractMetadataFromNotes(existingTask.notes);
          finalNotes = originalNotes;

          finalMetadata = {
            priority:
              updates.priority !== undefined
                ? updates.priority
                : existingMetadata.priority,
            isFlagged:
              updates.isFlagged !== undefined
                ? updates.isFlagged
                : existingMetadata.isFlagged,
            url: updates.url !== undefined ? updates.url : existingMetadata.url,
            tags:
              updates.tags !== undefined ? updates.tags : existingMetadata.tags,
          };
        }
      }

      taskData.notes = buildNotesWithMetadata(finalNotes, finalMetadata);
    }

    if (updates.due !== undefined) taskData.due = updates.due;
    if (updates.status !== undefined) {
      taskData.status = updates.status;

      if (updates.status === 'completed' && !updates.completed) {
        taskData.completed = new Date().toISOString();
      }
    }
    if (updates.completed !== undefined) taskData.completed = updates.completed;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (etag) {
      headers['If-Match'] = etag;
    }

    console.log('🔵 Google Tasks API Request (updateTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      method: 'PATCH',
      headers,
      body: taskData,
    });

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(taskData),
      }
    );

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (updateTask):', {
        url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
        status: response.status,
        statusText: response.statusText,
        requestData: taskData,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to update task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const updatedTask = await response.json();
    console.log('🟢 Google Tasks API Response (updateTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      status: response.status,
      data: { id: updatedTask.id, title: updatedTask.title },
    });

    return updatedTask;
  }

  async deleteTask(
    accessToken: string,
    taskId: string,
    etag?: string
  ): Promise<void> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
    };

    if (etag) {
      headers['If-Match'] = etag;
    }

    console.log('🔵 Google Tasks API Request (deleteTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      method: 'DELETE',
      headers: {
        Authorization: `Bearer [REDACTED]`,
        'If-Match': etag || 'not set',
      },
    });

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (deleteTask):', {
        url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
        status: response.status,
        statusText: response.statusText,
        taskId,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to delete task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    console.log('🟢 Google Tasks API Response (deleteTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      status: response.status,
      message: 'Task deleted successfully',
    });
  }

  /**
   * Get a single task by ID
   * Useful for fetching updated task details or checking if a task exists
   */
  async getTask(accessToken: string, taskId: string): Promise<GoogleTask> {
    console.log('🔵 Google Tasks API Request (getTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer [REDACTED]`,
      },
    });

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (getTask):', {
        url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
        status: response.status,
        statusText: response.statusText,
        taskId,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to get task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const fetchedTask = await response.json();
    console.log('🟢 Google Tasks API Response (getTask):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      status: response.status,
      data: { id: fetchedTask.id, title: fetchedTask.title },
    });

    return fetchedTask;
  }

  /**
   * Move a task to a different position or parent
   * This is useful for reordering tasks or changing parent-child relationships
   */
  async moveTask(
    accessToken: string,
    taskId: string,
    options: {
      parent?: string; // New parent task ID
      previous?: string; // Task ID that should come before this task
    }
  ): Promise<GoogleTask> {
    const url = new URL(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}/move`
    );

    if (options.parent) {
      url.searchParams.set('parent', options.parent);
    }

    if (options.previous) {
      url.searchParams.set('previous', options.previous);
    }

    console.log('🔵 Google Tasks API Request (moveTask):', {
      url: url.toString(),
      method: 'POST',
      headers: {
        Authorization: `Bearer [REDACTED]`,
      },
      params: options,
    });

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (moveTask):', {
        url: url.toString(),
        status: response.status,
        statusText: response.statusText,
        taskId,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to move task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const movedTask = await response.json();
    console.log('🟢 Google Tasks API Response (moveTask):', {
      url: url.toString(),
      status: response.status,
      data: { id: movedTask.id, title: movedTask.title },
    });

    return movedTask;
  }

  /**
   * Clear all completed tasks from the task list
   * This is useful for cleanup operations
   */
  async clearCompletedTasks(accessToken: string): Promise<void> {
    console.log('🔵 Google Tasks API Request (clearCompletedTasks):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/clear`,
      method: 'POST',
      headers: {
        Authorization: `Bearer [REDACTED]`,
      },
    });

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error('🔴 Google Tasks API Error (clearCompletedTasks):', {
        url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/clear`,
        status: response.status,
        statusText: response.statusText,
      });
      const errorText = await response.text();
      throw new Error(
        `Failed to clear completed tasks: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    console.log('🟢 Google Tasks API Response (clearCompletedTasks):', {
      url: `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/clear`,
      status: response.status,
      message: 'Completed tasks cleared successfully',
    });
  }

  /**
   * List all tasks with pagination support
   * This method handles pagination automatically and returns all tasks
   */
  async listAllTasks(
    accessToken: string,
    options?: {
      showCompleted?: boolean;
      showHidden?: boolean;
      showDeleted?: boolean;
      updatedMin?: string;
    }
  ): Promise<GoogleTask[]> {
    const allTasks: GoogleTask[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.listTasks(accessToken, {
        ...options,
        maxResults: MAX_PAGE_SIZE,
        pageToken,
      });

      if (response.items) {
        allTasks.push(...response.items);
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    return allTasks;
  }
}
