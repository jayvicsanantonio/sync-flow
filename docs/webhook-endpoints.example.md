# Webhook Endpoints Example Usage

## Base URL

```
https://your-domain.com/api/webhook/{userId}
```

## Endpoints

### 1. Create Task (NEW)

```bash
POST /api/webhook/{userId}/tasks

# Example:
curl -X POST https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation",
    "notes": "Update README and API docs",
    "due": "2024-12-31T23:59:59Z",
    "priority": 2,
    "url": "https://github.com/user/project",
    "tags": ["documentation", "important"]
  }'

# Example - Sync from Apple Reminders:
curl -X POST https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull request",
    "notes": "Check the new implementation",
    "priority": 3,
    "url": "https://github.com/user/repo/pull/123",
    "tags": ["code-review", "urgent"]
  }'

# Example - Create with custom sync ID (for Apple Reminders):
curl -X POST https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "notes": "Remember milk and eggs",
    "syncId": "sync_apple_reminder_12345"
  }'
{
  "message": "Task created successfully.",
  "taskId": "task-id-123",
  "syncId": "sync_1706697600000",
  "task": {
    "id": "task-id-123",
    "title": "Review pull request",
    "notes": "Check the new implementation\n\n--- Metadata ---\nPriority: High\nURL: https://github.com/user/repo/pull/123\nTags: #code-review #urgent\nSyncID: sync_1706697600000",
    "status": "needsAction",
    "kind": "tasks#task",
    "updated": "2024-01-31T10:00:00.000Z"
  }
}
```

### 2. Update Task (NEW)

```bash
PUT /api/webhook/{userId}/tasks

# Example 1: Update title and mark as completed
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "title": "Complete project documentation v2",
    "status": "completed"
  }'

# Example 2: Update only the due date
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "due": "2024-02-15T23:59:59Z"
  }'

# Example 3: Add or update notes
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "notes": "Remember to include API examples and migration guide"
  }'

# Example 4: Mark task as incomplete
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "status": "needsAction"
  }'

# Example 5: Update task priority
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "priority": 3  # High priority
  }'

# Example 6: Update task URL (sync Apple Reminders URL)
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "url": "https://docs.google.com/document/d/abc123"  # Maps to/from Apple Reminders url
  }'

# Example 7: Update multiple fields at once
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "title": "Updated task title",
    "priority": 3
  }'

# Example 8: Update priority and tags
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "priority": 3,
    "tags": ["urgent", "high-priority", "review"]
  }'

# Example 9: Update using sync ID (for Apple Reminders):
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "sync_apple_reminder_12345",
    "title": "Buy groceries - Updated",
    "status": "completed"
  }'

# Response:
{
  "message": "Task updated successfully.",
  "taskId": "task-id-123",
  "task": {
    "id": "task-id-123",
    "title": "Complete project documentation v2",
    "status": "completed",
    "updated": "2024-01-31T10:00:00.000Z",
    "notes": "Remember to include API examples and migration guide",
    "due": "2024-02-15T23:59:59Z",
    ...
  }
}
```

### 3. Delete Task (NEW)

```bash
DELETE /api/webhook/{userId}/tasks

# Example:
curl -X DELETE https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123"
  }'

# Example - Delete using sync ID (for Apple Reminders):
curl -X DELETE https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "sync_apple_reminder_12345"
  }'

# Response:
{
  "message": "Task deleted successfully.",
  "taskId": "task-id-123",
  "deleted": true
}

# Note: This is a permanent action. The task cannot be recovered once deleted.
```

### 4. Legacy Create Task (for backwards compatibility)

```bash
POST /api/webhook/{userId}

# Example:
curl -X POST https://your-domain.com/api/webhook/user123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Legacy task creation",
    "notes": "This uses the old endpoint",
    "due": "2024-12-31T23:59:59Z"
  }'
```

## Notes

- The legacy endpoint `/api/webhook/{userId}` is maintained for backwards compatibility
- New endpoints follow RESTful conventions:
  - POST for create
  - PUT for update
  - DELETE for delete
- All endpoints require a valid `userId` parameter
- Update and Delete endpoints accept either `taskId` or `syncId` in the request body (JSON)
- Update endpoint allows partial updates (only send fields you want to change)

### Metadata Storage

- All metadata (priority, url, tags, syncId) is stored in the notes field
- Metadata is appended in a structured format for easy parsing:

  ```
  [User's notes]

  --- Metadata ---
  Priority: High
  URL: https://example.com
  Tags: #tag1 #tag2
  SyncID: sync_1706697600000
  ```

### Sync ID Usage

- When creating a task from Apple Reminders, include a `syncId` in the request
- If no `syncId` is provided, one will be generated automatically
- Use the `syncId` to update or delete tasks without knowing the Google Task ID
- The `syncId` is stored in the task's notes metadata and persists across syncs

### Supported Fields

- Update endpoint supports:
  - `title`: Task title
  - `notes`: Task description/notes (metadata will be appended)
  - `due`: Due date (RFC 3339 format)
  - `status`: Task status ('needsAction' or 'completed')
  - `priority`: Priority level (0-3) - stored in notes
  - `url`: URL - stored in notes
  - `tags`: Array of tags - stored in notes
- Create endpoint supports:
  - `title`: Task title (required)
  - `notes`: Task description/notes
  - `due`: Due date (RFC 3339 format)
  - `priority`: Priority level (0-3) - stored in notes
  - `url`: URL associated with the task - stored in notes
  - `tags`: Array of tags for categorization - stored in notes
- Delete endpoint is fully implemented - permanently removes tasks from Google Tasks
- All endpoints handle errors gracefully with detailed error messages
