import type {
  GoogleTask,
  GoogleTasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../types/google-api';

const TASKS_API_BASE_URL = 'https://tasks.googleapis.com/tasks/v1';
const DEFAULT_TASK_LIST = '@default';
const MAX_PAGE_SIZE = 100;

export class GoogleTasksService {
  async createTask(
    accessToken: string,
    title: string,
    notes?: string,
    due?: string,
    starred?: boolean,
    parent?: string
  ): Promise<GoogleTask> {
    const taskData: CreateTaskRequest = {
      title: title || 'New Reminder',
    };

    if (notes) taskData.notes = notes;
    if (due) taskData.due = due;
    if (starred !== undefined) taskData.starred = starred;
    if (parent) taskData.parent = parent;

    const url = new URL(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks`
    );

    if (parent) {
      url.searchParams.set('parent', parent);
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        requestData: taskData,
      });
      throw new Error(
        `Failed to create task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
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

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API Error (list):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to fetch tasks: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  async updateTask(
    accessToken: string,
    taskId: string,
    updates: UpdateTaskRequest,
    etag?: string
  ): Promise<GoogleTask> {
    const taskData: UpdateTaskRequest = {};
    if (updates.title !== undefined) taskData.title = updates.title;
    if (updates.notes !== undefined) taskData.notes = updates.notes;
    if (updates.due !== undefined) taskData.due = updates.due;
    if (updates.status !== undefined) {
      taskData.status = updates.status;

      if (updates.status === 'completed' && !updates.completed) {
        taskData.completed = new Date().toISOString();
      }
    }
    if (updates.completed !== undefined) taskData.completed = updates.completed;
    if (updates.starred !== undefined) taskData.starred = updates.starred;
    if (updates.parent !== undefined) taskData.parent = updates.parent;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (etag) {
      headers['If-Match'] = etag;
    }

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify(taskData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API Error (update):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        taskId,
        updates: taskData,
      });
      throw new Error(
        `Failed to update task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
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

    const response = await fetch(
      `${TASKS_API_BASE_URL}/lists/${DEFAULT_TASK_LIST}/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API Error (delete):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        taskId,
      });
      throw new Error(
        `Failed to delete task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
  }

  /**
   * Get a single task by ID
   * Useful for fetching updated task details or checking if a task exists
   */
  async getTask(accessToken: string, taskId: string): Promise<GoogleTask> {
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
      const errorText = await response.text();
      console.error('Google Tasks API Error (get):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        taskId,
      });
      throw new Error(
        `Failed to get task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
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

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Tasks API Error (move):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        taskId,
        options,
      });
      throw new Error(
        `Failed to move task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Clear all completed tasks from the task list
   * This is useful for cleanup operations
   */
  async clearCompletedTasks(accessToken: string): Promise<void> {
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
      const errorText = await response.text();
      console.error('Google Tasks API Error (clear):', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to clear completed tasks: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
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
