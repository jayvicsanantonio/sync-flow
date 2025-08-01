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

# Example:
curl -X PUT https://your-domain.com/api/webhook/user123/tasks/task-id-123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Complete project documentation v2",
    "status": "completed"
  }'

# Response:
{
  "message": "Task update endpoint ready (implementation pending).",
  "taskId": "task-id-123",
  "updatedFields": { ... }
}
```

### 3. Delete Task (NEW)
```bash
DELETE /api/webhook/{userId}/tasks/{taskId}

# Example:
curl -X DELETE https://your-domain.com/api/webhook/user123/tasks/task-id-123

# Response:
{
  "message": "Task delete endpoint ready (implementation pending).",
  "taskId": "task-id-123",
  "deleted": true
}
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
- The Google Tasks service methods for update and delete need to be implemented
