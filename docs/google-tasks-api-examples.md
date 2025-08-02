# Google Tasks API Usage Examples

This document provides examples of using the improved Google Tasks API service with best practices.

## Key Improvements Made

1. **Constants and Configuration**
   - Centralized API base URL and constants
   - Configurable page size limits
   - Better URL construction using URL API

2. **Enhanced Error Handling**
   - Detailed error logging with context
   - Proper error messages for debugging
   - HTTP status code handling

3. **Optimistic Concurrency Control**
   - Support for ETags in update and delete operations
   - Prevents conflicting updates
   - Better sync reliability

4. **Pagination Support**
   - Proper pagination parameters
   - Helper method to fetch all tasks
   - Configurable page sizes

5. **Sync Optimization**
   - Support for `updatedMin` parameter to fetch only changed tasks
   - Last sync time tracking
   - Efficient incremental syncing

6. **Additional Methods**
   - `getTask()` - Fetch single task details
   - `moveTask()` - Reorder tasks or change parent
   - `clearCompletedTasks()` - Bulk cleanup
   - `listAllTasks()` - Auto-pagination helper

## Usage Examples

### Creating a Task with All Features

```typescript
// Create a high-priority subtask with due date
const task = await googleTasksService.createTask(
  accessToken,
  'Review pull request',
  'Check the new sync implementation', // notes
  '2024-02-15T17:00:00Z', // due date (RFC 3339)
  true, // starred (high priority)
  'parent-task-id-123' // parent task ID
);
```

### Efficient Sync with Pagination

```typescript
// Fetch only tasks updated since last sync
const response = await googleTasksService.listTasks(accessToken, {
  showCompleted: false,
  showHidden: false,
  updatedMin: lastSyncTime, // RFC 3339 timestamp
  maxResults: 100,
});

// Handle pagination
if (response.nextPageToken) {
  const nextPage = await googleTasksService.listTasks(accessToken, {
    pageToken: response.nextPageToken,
    // ... other options
  });
}
```

### Safe Updates with ETag

```typescript
// First, get the task with its current ETag
const task = await googleTasksService.getTask(accessToken, taskId);

// Update with optimistic concurrency control
try {
  const updated = await googleTasksService.updateTask(
    accessToken,
    taskId,
    {
      title: 'Updated title',
      starred: true,
      status: 'completed',
    },
    task.etag // Pass the ETag to prevent conflicts
  );
} catch (error) {
  if (error.message.includes('412')) {
    // Precondition failed - task was modified by another client
    console.log('Task was modified, refetch and retry');
  }
}
```

### Fetch All Tasks with Auto-Pagination

```typescript
// Automatically handles pagination
const allTasks = await googleTasksService.listAllTasks(accessToken, {
  showCompleted: true,
  showHidden: false,
  updatedMin: '2024-01-01T00:00:00Z',
});

console.log(`Found ${allTasks.length} tasks`);
```

### Moving Tasks (Reordering/Reparenting)

```typescript
// Move a task under a new parent
await googleTasksService.moveTask(accessToken, taskId, {
  parent: 'new-parent-task-id',
  previous: 'sibling-task-id', // Optional: position after this task
});

// Move to top level (remove parent)
await googleTasksService.moveTask(accessToken, taskId, {
  parent: '', // Empty string removes parent
});
```

## API Request Headers

All requests now include proper headers:

```json
{
  "Authorization": "Bearer {accessToken}",
  "Content-Type": "application/json",
  "Accept": "application/json"
}
```

## Error Handling

The service now provides detailed error information:

```typescript
try {
  await googleTasksService.createTask(accessToken, title);
} catch (error) {
  // Error message includes:
  // - HTTP status code
  // - Status text
  // - Response body
  // - Request context
  console.error('Failed to create task:', error.message);
}
```

## Rate Limiting Considerations

Google Tasks API has rate limits. Consider implementing:

1. Exponential backoff for retries
2. Request queuing
3. Bulk operations where possible
4. Caching of task data

## Security Best Practices

1. Always use HTTPS (enforced by the service)
2. Store access tokens securely
3. Implement token refresh before expiry
4. Use ETags for concurrent update protection
5. Validate all input data

## Sync Strategy Recommendations

1. Track `lastSyncTime` per user
2. Use `updatedMin` to fetch only changed tasks
3. Handle pagination for large task lists
4. Implement conflict resolution for concurrent edits
5. Store task ETags for optimistic concurrency control
6. Handle deleted tasks (check `deleted` flag)
7. Respect task hierarchy (parent-child relationships)

## Future Enhancements

Consider adding:

1. Batch operations support
2. Task list management (beyond @default)
3. Retry logic with exponential backoff
4. Request/response interceptors for logging
5. WebSocket support for real-time updates
6. Offline queue for sync operations
