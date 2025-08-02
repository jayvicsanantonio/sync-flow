/**
 * Represents a link associated with a Google Task.
 * This is used to map to Apple Reminders' `url` property.
 */
export interface GoogleLink {
  type: 'email' | 'phone' | string; // Type of the link, e.g., 'email'.
  description: string; // The text describing the link.
  link: string; // The actual URL.
}

/**
 * Represents the core user-editable data for a Google Task.
 * This is the base for creating or updating a task.
 */
export interface GoogleTaskData {
  title: string;
  notes?: string;
  due?: string; // RFC 3339 timestamp. Absence of time means it's an all-day task.

  /**
   * @description Represents a "starred" task in Google Tasks.
   * This is the closest equivalent to Apple Reminders' "isFlagged".
   * It's a boolean, not a graded scale.
   * Sync Strategy: Map this to Apple Reminders' isFlagged property.
   */
  starred?: boolean;
}

/**
 * Represents a full Google Task object as returned by the API.
 * It includes system-managed fields essential for sync logic.
 */
export interface GoogleTask extends GoogleTaskData {
  id: string; // The unique identifier for the task.
  kind: 'tasks#task';
  etag?: string; // Etag for optimistic concurrency control. Crucial for safe updates.
  status: 'needsAction' | 'completed';
  updated: string; // RFC 3339 timestamp of the last update time. Used to check for changes.
  selfLink: string;

  /**
   * @description The timestamp when the task was completed.
   * Only present if status is 'completed'. Maps to Apple Reminders' `completionDate`.
   */
  completed?: string;

  /**
   * @description ID of the parent task.
   * This field is how Google Tasks implements subtasks.
   * Essential for syncing hierarchical task structures.
   */
  parent?: string;

  /**
   * @description Flag indicating if the task has been deleted.
   * Important for a sync engine to know whether to delete the corresponding
   * reminder in Apple's ecosystem.
   */
  deleted?: boolean;

  /**
   * @description An array of links associated with the task.
   * Sync Strategy: The first link in this array can be mapped to the `url`
   * property of an Apple Reminder.
   */
  links?: GoogleLink[];
}

/**
 * Standard wrapper for a list of tasks returned by the Google Tasks API.
 */
export interface GoogleTasksListResponse {
  kind: 'tasks#tasks';
  etag?: string;
  nextPageToken?: string; // Token for paginating through results.
  items?: GoogleTask[];
}

/**
 * Represents the request body for creating a new task.
 * Inherits user-editable fields and adds properties available at creation time.
 */
export interface CreateTaskRequest extends GoogleTaskData {
  /**
   * @description The ID of the parent task under which to create this subtask.
   */
  parent?: string;

  /**
   * @description Links associated with the task.
   */
  links?: GoogleLink[];
}

/**
 * Represents the request body for updating a task (PATCH operation).
 * All fields are optional.
 */
export interface UpdateTaskRequest {
  title?: string;
  notes?: string;
  due?: string;
  status?: 'needsAction' | 'completed';

  /**
   * @description To mark a task as complete, you should set `status: 'completed'`.
   * The `completed` timestamp is generally managed by the API, not set directly.
   * Including it here for completeness, but direct manipulation is uncommon.
   */
  completed?: string;

  /**
   * @description Set to `true` or `false` to star or unstar the task.
   * Used to sync priority/flagged status.
   */
  starred?: boolean;

  /**
   * @description Move a task to become a subtask of another.
   * To make a subtask a top-level task, you would need a 'move' operation,
   * which isn't directly supported via a simple `parent: null` update.
   */
  parent?: string;

  /**
   * @description Links associated with the task.
   */
  links?: GoogleLink[];
}

/**
 * Represents the user profile information obtained from Google's OAuth2 flow.
 * No changes needed here as it's standard user info.
 */
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
