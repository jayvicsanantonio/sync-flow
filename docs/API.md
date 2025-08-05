# API Reference

## Base URL

Development: `http://localhost:3000/api`  
Production: `https://your-domain.vercel.app/api`

## Authentication

Sync Flow uses Google OAuth 2.0 for authentication. Users must complete the OAuth flow before using the API endpoints.

## Endpoints

### 1. Home Page

**GET** `/`

Displays the landing page with Google sign-in button.

#### Response

- **Content-Type**: `text/html`
- **Body**: HTML page with OAuth login interface

---

### 2. OAuth Callback

**GET** `/auth/google/callback`

Handles the OAuth callback from Google after user authorization.

#### Query Parameters

| Parameter | Type   | Required | Description                    |
| --------- | ------ | -------- | ------------------------------ |
| code      | string | Yes      | Authorization code from Google |

#### Success Response

- **Content-Type**: `text/html`
- **Body**: Success page showing user profile and ID

#### Error Response

- **Status**: 500
- **Content-Type**: `text/html`
- **Body**: Error page with details

---

### 3. Create Task

**POST** `/webhook/:userId/tasks`

Creates a new task in Google Tasks from Apple Reminders.

#### URL Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| userId    | string | Yes      | Google user ID |

#### Request Body

```json
{
  "title": "Task Title",
  "notes": "Task description",
  "due": "2024-08-05T10:00:00Z",
  "priority": "High",
  "url": "https://example.com",
  "tags": "work,urgent",
  "syncId": "sync_123456",
  "isCompleted": false
}
```

#### Field Descriptions

| Field       | Type    | Required | Description                                      |
| ----------- | ------- | -------- | ------------------------------------------------ |
| title       | string  | Yes      | Task title (min 1 character)                     |
| notes       | string  | No       | Task description                                 |
| due         | string  | No       | Due date in ISO 8601 format                      |
| priority    | string  | No       | Priority: "None", "Low", "Medium", "High"        |
| url         | string  | No       | Associated URL                                   |
| tags        | string  | No       | Comma-separated tags                             |
| syncId      | string  | No       | Sync identifier (auto-generated if not provided) |
| isCompleted | boolean | No       | Task completion status                           |

#### Success Response

- **Status**: 201 Created

```json
{
  "message": "Task created successfully.",
  "taskId": "google_task_id",
  "syncId": "sync_123456",
  "task": {
    "id": "google_task_id",
    "title": "Task Title",
    "notes": "Task description\n\n--- Metadata ---\nPriority: High\nURL: https://example.com\nTags: work,urgent\nSyncID: sync_123456",
    "status": "needsAction",
    "updated": "2024-08-05T10:00:00.000Z"
  }
}
```

---

### 4. Update Task

**PUT** `/webhook/:userId/tasks`

Updates an existing task in Google Tasks.

#### URL Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| userId    | string | Yes      | Google user ID |

#### Request Body

```json
{
  "syncId": "sync_123456",
  "title": "Updated Title",
  "notes": "Updated description",
  "due": "2024-08-06T10:00:00Z",
  "priority": "Medium",
  "isCompleted": true,
  "url": "https://updated.com",
  "tags": "updated,tags"
}
```

#### Field Descriptions

| Field       | Type    | Required | Description                           |
| ----------- | ------- | -------- | ------------------------------------- |
| syncId      | string  | Yes      | Sync identifier of the task to update |
| title       | string  | No       | Updated task title                    |
| notes       | string  | No       | Updated task description              |
| due         | string  | No       | Updated due date                      |
| priority    | string  | No       | Updated priority                      |
| isCompleted | boolean | No       | Updated completion status             |
| url         | string  | No       | Updated URL                           |
| tags        | string  | No       | Updated tags                          |

#### Success Response

- **Status**: 200 OK

```json
{
  "message": "Task updated successfully.",
  "taskId": "google_task_id",
  "task": {
    "id": "google_task_id",
    "title": "Updated Title",
    "status": "completed",
    "completed": "2024-08-05T10:30:00.000Z"
  }
}
```

#### Error Response

- **Status**: 404 Not Found

```json
{
  "error": "Task not found for provided syncId."
}
```

---

### 5. Delete Task

**DELETE** `/webhook/:userId/tasks`

Deletes a task from Google Tasks.

#### URL Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| userId    | string | Yes      | Google user ID |

#### Request Body

```json
{
  "syncId": "sync_123456"
}
```

#### Success Response

- **Status**: 200 OK

```json
{
  "message": "Task deleted successfully.",
  "taskId": "google_task_id",
  "deleted": true
}
```

#### Error Response

- **Status**: 404 Not Found

```json
{
  "error": "Task not found for provided syncId."
}
```

---

### 6. Fetch Updates

**GET** `/fetch-updates/:userId`

Fetches tasks from Google Tasks that have been created or updated since the last sync.

#### URL Parameters

| Parameter | Type   | Required | Description    |
| --------- | ------ | -------- | -------------- |
| userId    | string | Yes      | Google user ID |

#### Success Response

- **Status**: 200 OK

```json
{
  "tasks": [
    {
      "id": "google_task_id",
      "kind": "tasks#task",
      "title": "Task Title",
      "notes": "Description with metadata",
      "status": "needsAction",
      "updated": "2024-08-05T10:00:00.000Z",
      "due": "2024-08-06T00:00:00.000Z"
    }
  ],
  "hasMore": false,
  "syncedAt": "2024-08-05T10:30:00.000Z"
}
```

#### Error Responses

- **Status**: 401 Unauthorized

```json
{
  "error": "Authentication expired. Please re-authorize the app."
}
```

- **Status**: 404 Not Found

```json
{
  "error": "User not found."
}
```

- **Status**: 500 Internal Server Error

```json
{
  "error": "Failed to fetch tasks from Google."
}
```

## Error Handling

All endpoints use consistent error response format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional additional information
}
```

### Error Codes

| Code                 | HTTP Status | Description                       |
| -------------------- | ----------- | --------------------------------- |
| AUTHENTICATION_ERROR | 401         | Invalid or expired authentication |
| VALIDATION_ERROR     | 400         | Invalid request data              |
| NOT_FOUND            | 404         | Resource not found                |
| GOOGLE_API_ERROR     | 500         | Google API request failed         |
| INTERNAL_ERROR       | 500         | Unexpected server error           |

## Rate Limiting

Currently, the API does not implement rate limiting. This is planned for future releases.

## Webhook Integration

For Apple Reminders integration, configure webhooks to point to:

- Create: `POST /api/webhook/{userId}/tasks`
- Update: `PUT /api/webhook/{userId}/tasks`
- Delete: `DELETE /api/webhook/{userId}/tasks`

The `userId` is obtained after successful OAuth authentication.

## Metadata Format

Tasks store Apple Reminders-specific metadata in the Google Task notes field:

```
Original task notes

--- Metadata ---
Priority: High
URL: https://example.com
Tags: work,urgent
SyncID: sync_123456
```

This format preserves additional information that Google Tasks doesn't natively support.
