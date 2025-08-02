import type {
  GoogleTask,
  GoogleTasksListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../types/google-api';

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

    const response = await fetch(
      'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      }
    );

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

  async listTasks(accessToken: string): Promise<GoogleTasksListResponse> {
    const response = await fetch(
      'https://tasks.googleapis.com/tasks/v1/lists/@default/tasks?showCompleted=false&showHidden=false',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

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
    updates: UpdateTaskRequest
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

    const response = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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

  async deleteTask(accessToken: string, taskId: string): Promise<void> {
    const response = await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${taskId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
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
}
