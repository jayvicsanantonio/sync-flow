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
    "due": "2024-12-31T23:59:59Z"
  }'

# Response:
{
  "message": "Task created successfully.",
  "taskId": "task-id-123",
  "task": { ... }
}
```

### 2. Update Task (NEW)
```bash
PUT /api/webhook/{userId}/tasks/{taskId}

# Example 1: Update title and mark as completed
curl -X PUT https://your-domain.com/api/webhook/user123/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation v2",
    "status": "completed"
  }'

# Example 2: Update only the due date
curl -X PUT https://your-domain.com/api/webhook/user123/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "due": "2024-02-15T23:59:59Z"
  }'

# Example 3: Add or update notes
curl -X PUT https://your-domain.com/api/webhook/user123/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Remember to include API examples and migration guide"
  }'

# Example 4: Mark task as incomplete
curl -X PUT https://your-domain.com/api/webhook/user123/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "needsAction"
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
DELETE /api/webhook/{userId}/tasks/{taskId}

# Example:
curl -X DELETE https://your-domain.com/api/webhook/user123/tasks/task-id-123

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
- Update and Delete endpoints require both `userId` and `taskId` parameters
- Update endpoint allows partial updates (only send fields you want to change)
- Update endpoint is fully implemented and supports updating title, notes, due date, and status
- Delete endpoint is fully implemented - permanently removes tasks from Google Tasks
- All endpoints handle errors gracefully with detailed error messages
