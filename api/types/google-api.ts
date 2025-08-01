export interface GoogleTaskData {
  title: string;
  notes?: string;
  due?: string;
}

export interface GoogleTask extends GoogleTaskData {
  id: string;
  status?: 'needsAction' | 'completed';
  updated?: string;
  selfLink?: string;
}

export interface GoogleTasksListResponse {
  kind: string;
  etag?: string;
  items?: GoogleTask[];
}

export interface CreateTaskRequest extends GoogleTaskData {}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale?: string;
}
