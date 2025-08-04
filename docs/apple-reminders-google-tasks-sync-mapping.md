# Apple Reminders ↔ Google Tasks Sync Mapping

This document explains how properties are mapped between Apple Reminders and Google Tasks when syncing.

## Property Mappings

### 1. **Priority Status**

- **Apple Reminders**: `priority` (0-9 scale)
- **Google Tasks**: Stored in notes metadata as priority (boolean - High/Normal)
- **Mapping**: Priority values mapped to boolean
- **Notes**: High priority (5-9) maps to true, Normal priority (0-4) maps to false

```javascript
// Apple Reminders → Google Tasks
// Priority is stored in notes metadata
const isHighPriority = appleReminder.priority >= 5;

// Google Tasks → Apple Reminders
// Extract priority from notes metadata
const priority = metadata.priority ? 9 : 0;
```

### 2. **URL/Link**

- **Apple Reminders**: `url` (single URL string)
- **Google Tasks**: `links` (array of link objects)
- **Mapping**:
  - Apple → Google: Create single link in array
  - Google → Apple: Use first link in array

```javascript
// Apple Reminders → Google Tasks
if (appleReminder.url) {
  googleTask.links = [
    {
      type: 'url',
      description: 'Link',
      link: appleReminder.url,
    },
  ];
}

// Google Tasks → Apple Reminders
if (googleTask.links && googleTask.links.length > 0) {
  appleReminder.url = googleTask.links[0].link;
}
```

### 3. **Basic Properties** (Direct Mapping)

| Apple Reminders  | Google Tasks | Notes                        |
| ---------------- | ------------ | ---------------------------- |
| `title`          | `title`      | Task name/title              |
| `notes`          | `notes`      | Task description             |
| `dueDate`        | `due`        | Due date (RFC 3339 format)   |
| `isCompleted`    | `status`     | 'completed' or 'needsAction' |
| `completionDate` | `completed`  | Completion timestamp         |

### 4. **Subtasks/Hierarchy**

- **Apple Reminders**: Subtasks are separate reminders with parent reference
- **Google Tasks**: `parent` field contains parent task ID
- **Mapping**: Direct parent ID mapping

### 5. **Properties Not Directly Mapped**

#### Apple Reminders properties without Google Tasks equivalent:

- `alarms` - No equivalent in Google Tasks
- `location` - No equivalent in Google Tasks
- `alarms` - No equivalent in Google Tasks
- `recurrence` - Google Tasks doesn't support recurring tasks

#### Google Tasks properties without Apple Reminders equivalent:

- `etag` - Used for optimistic concurrency control
- `kind` - API resource type identifier
- `selfLink` - API resource URL
- `deleted` - Soft delete flag

## Implementation Examples

### Creating a Task from Apple Reminders

```typescript
// When syncing from Apple Reminders to Google Tasks
const createGoogleTaskFromAppleReminder = async (reminder: AppleReminder) => {
  const task = await googleTasksService.createTask(
    accessToken,
    reminder.title,
    reminder.notes,
    reminder.dueDate?.toISOString(),
    reminder.priority >= 5, // High priority if 5 or above
    reminder.parentId,
    reminder.url // Maps to links[0]
  );

  return task;
};
```

### Updating Google Tasks from Apple Reminders

```typescript
// When updating Google Tasks with Apple Reminders changes
const updateGoogleTaskFromAppleReminder = async (
  taskId: string,
  reminder: AppleReminder
) => {
  const updates: UpdateTaskRequest = {
    title: reminder.title,
    notes: reminder.notes,
    due: reminder.dueDate?.toISOString(),
    status: reminder.isCompleted ? 'completed' : 'needsAction',
    priority: reminder.priority >= 5,
  };

  // Handle URL update
  if (reminder.url) {
    updates.links = [
      {
        type: 'url',
        description: 'Link',
        link: reminder.url,
      },
    ];
  }

  const task = await googleTasksService.updateTask(
    accessToken,
    taskId,
    updates
  );

  return task;
};
```

### Syncing from Google Tasks to Apple Reminders

```typescript
// When syncing Google Tasks to Apple Reminders
const createAppleReminderFromGoogleTask = (task: GoogleTask) => {
  const reminder = {
    title: task.title,
    notes: task.notes,
    dueDate: task.due ? new Date(task.due) : undefined,
    isCompleted: task.status === 'completed',
    completionDate: task.completed ? new Date(task.completed) : undefined,
    priority: extractedMetadata.priority ? 9 : 0,
    url: task.links?.[0]?.link,
    parentId: task.parent,
  };

  return reminder;
};
```

## Best Practices

1. **Priority Handling**: Since Apple Reminders has a 0-9 priority scale:
   - Priority 0-4 → Normal priority (false in metadata)
   - Priority 5-9 → High priority (true in metadata)
   - The priority is stored in the notes metadata section

2. **URL Handling**:
   - Always use the first link when converting from Google Tasks
   - Preserve link type information if needed in notes

3. **Sync Conflicts**:
   - Use Google Tasks' `etag` for optimistic concurrency control
   - Track `updated` timestamp to resolve conflicts
   - Implement proper conflict resolution strategy

4. **Deleted Items**:
   - Check Google Tasks' `deleted` flag during sync
   - Remove corresponding Apple Reminder when detected

5. **Limitations**:
   - Inform users that location-based reminders won't sync
   - Recurring tasks need special handling or user notification
   - Alarms/notifications won't sync automatically

## API Usage Examples

### Create Task with URL and Flag

```bash
curl -X POST https://your-api.com/api/webhook/{userId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review design mockups",
    "notes": "Check the new UI designs",
    "starred": true,
    "url": "https://figma.com/file/abc123"
  }'
```

### Update Task Priority and URL

```bash
curl -X PUT https://your-api.com/api/webhook/{userId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task-123",
    "starred": false,
    "url": "https://updated-link.com"
  }'
```

## Future Enhancements

1. **Rich Links**: Support multiple URLs by storing additional links in notes with a special format
2. **Priority Mapping**: Store exact priority value in task notes with a special marker
3. **Location Data**: Store location information in notes with geocoding
4. **Recurrence**: Implement custom recurrence handling with scheduled task creation
