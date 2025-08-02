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
    "starred": true,
<<<<<<< HEAD
    "parent": "parent-task-id-456"
=======
    "parent": "parent-task-id-456",
    "url": "https://github.com/user/project"
>>>>>>> d7ca970 (Update webhook schemas and handlers to support additional task properties)
  }'

# Example - Sync from Apple Reminders:
curl -X POST https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review pull request",
    "notes": "Check the new implementation",
    "starred": true,  # Maps from Apple Reminders isFlagged
    "url": "https://github.com/user/repo/pull/123"  # Maps from Apple Reminders url
  }'
{
  "message": "Task created successfully.",
  "taskId": "task-id-123",
  "task": { ... }
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
    "status": "completed",
    "starred": true
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

<<<<<<< HEAD
# Example 5: Star/unstar a task (high priority)
=======
# Example 5: Star/unstar a task (sync Apple Reminders flagged status)
>>>>>>> d7ca970 (Update webhook schemas and handlers to support additional task properties)
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
<<<<<<< HEAD
    "starred": false
  }'

# Example 6: Move task under a parent (create subtask)
=======
    "starred": false  # Maps to/from Apple Reminders isFlagged
  }'

# Example 6: Update task URL (sync Apple Reminders URL)
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "url": "https://docs.google.com/document/d/abc123"  # Maps to/from Apple Reminders url
  }'

# Example 7: Move task under a parent (create subtask)
>>>>>>> d7ca970 (Update webhook schemas and handlers to support additional task properties)
curl -X PUT https://your-domain.com/api/webhook/user123/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-id-123",
    "parent": "parent-task-id-789"
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
- Update and Delete endpoints now require `taskId` to be passed in the request body (JSON)
- Update endpoint allows partial updates (only send fields you want to change)
- Update endpoint is fully implemented and supports updating:
  - `title`: Task title
  - `notes`: Task description/notes
  - `due`: Due date (RFC 3339 format)
  - `status`: Task status ('needsAction' or 'completed')
  - `starred`: Boolean flag for high priority tasks
  - `parent`: Parent task ID for creating subtasks
- Create endpoint supports:
  - `title`: Task title (required)
  - `notes`: Task description/notes
  - `due`: Due date (RFC 3339 format)
  - `starred`: Boolean flag for high priority tasks
  - `parent`: Parent task ID to create as subtask
- Delete endpoint is fully implemented - permanently removes tasks from Google Tasks
- All endpoints handle errors gracefully with detailed error messages
