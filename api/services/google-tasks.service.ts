import type {
  GoogleTask,
  GoogleTasksListResponse,
  CreateTaskRequest,
} from '../types/google-api';

export class GoogleTasksService {
  async createTask(
    accessToken: string,
    title: string,
    notes?: string,
    due?: string
  ): Promise<GoogleTask> {
    const taskData: CreateTaskRequest = {
      title: title || 'New Reminder',
    };

    if (notes) taskData.notes = notes;
    if (due) taskData.due = due;

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
        accessToken,
      });
      throw new Error(
        `Failed to create task: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  async listTasks(
    accessToken: string
  ): Promise<GoogleTasksListResponse> {
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
}
