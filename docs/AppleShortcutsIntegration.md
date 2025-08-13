# Apple Shortcuts Integration Guide for Sync Endpoint

This guide explains how to integrate the `GET /sync/:userId` endpoint with Apple Shortcuts and set up automated syncing from Google Tasks to Apple Reminders.

## Overview

You'll create three separate shortcuts (one for each sync type) and then a master shortcut that runs all three in sequence. This will be automated to run periodically (e.g., hourly).

## Prerequisites

- Your Sync Flow API is deployed and accessible
- You have your Google User ID from the OAuth authentication
- Apple Shortcuts app on iOS/iPadOS device
- A dedicated Reminders list for synced tasks (recommended)

## Part 1: Create Individual Sync Shortcuts

### A. Shortcut for Added Tasks

1. **Open Shortcuts app** on your iPhone/iPad
2. Tap **+** to create new shortcut
3. **Name it**: "Sync Added Tasks from Google"

#### Build the shortcut:

1. **Add URL action**
   - Search for "URL"
   - Enter: `https://your-domain.vercel.app/api/sync/YOUR_USER_ID?type=added`
   - Replace `YOUR_USER_ID` with your actual user ID from OAuth

2. **Add Get Contents of URL**
   - Method: GET
   - Headers: Leave empty (API uses OAuth tokens internally)

3. **Add Get Dictionary from Input**
   - This parses the JSON response

4. **Add Get Dictionary Value**
   - Get: Value for "tasks" in the previous step

5. **Add Repeat with Each**
   - Repeat with each item in the tasks array

6. **Inside the Repeat block, add:**
   - **Get Dictionary Value**: Get "title" from Repeat Item
   - **Get Dictionary Value**: Get "notes" from Repeat Item
   - **Get Dictionary Value**: Get "due" from Repeat Item
   - **Get Dictionary Value**: Get "syncId" from Repeat Item
   - **Get Dictionary Value**: Get "status" from Repeat Item
   
7. **Process the notes to preserve syncId:**
   - **Add Text action**: Combine notes with syncId
   - Format: `[notes]\n\n[SyncID: [syncId]]`

8. **Add "Add New Reminder"**
   - Title: Use the title variable
   - Notes: Use the combined text from step 7
   - Alert: Use the due date variable (if exists)
   - List: Choose your target list (e.g., "Google Tasks Sync")
   - Toggle completion if status is "completed"

9. **End Repeat**

10. **Add Show Notification** (optional)
    - Title: "Sync Complete"
    - Body: Show count of added tasks

### B. Shortcut for Updated Tasks

1. **Create new shortcut**: "Sync Updated Tasks from Google"
2. **URL**: `https://your-domain.vercel.app/api/sync/YOUR_USER_ID?type=updated`

#### Build the shortcut:

1-4. Same as Added Tasks shortcut (URL, Get Contents, Parse JSON, Get tasks)

5. **Add Repeat with Each** for tasks array

6. **Inside Repeat block:**
   - Extract all task properties (title, notes, due, syncId, status)
   - **Add "Find Reminders"** action:
     - Add Filter: "Notes" contains `[SyncID: [syncId]]`
     - Limit: 1
   
7. **Add "If" condition**
   - If "Reminders" has any value
   
8. **Inside If block:**
   - **Get item from list**: First item from Reminders
   - **Edit Reminder**:
     - Reminder: The found reminder
     - Title: New title
     - Notes: New notes (preserve syncId format)
     - Due Date: New due date
     - Is Completed: Based on status

9. **End If** and **End Repeat**

### C. Shortcut for Deleted Tasks

1. **Create new shortcut**: "Sync Deleted Tasks from Google"
2. **URL**: `https://your-domain.vercel.app/api/sync/YOUR_USER_ID?type=deleted`

#### Build the shortcut:

1-3. Same initial steps (URL, Get Contents, Parse JSON)

4. **Get Dictionary Value**: Get "syncIds" from response

5. **Add Repeat with Each** for syncIds array

6. **Inside Repeat block:**
   - **Add "Find Reminders"** action:
     - Add Filter: "Notes" contains `[SyncID: [Repeat Item]]`
     - Limit: 1
   
7. **Add "If" condition**
   - If "Reminders" has any value

8. **Inside If block:**
   - **Remove Reminders**: Remove the found reminders

9. **End If** and **End Repeat**

## Part 2: Create Master Sync Shortcut

1. **Create new shortcut**: "Sync All Google Tasks"

2. **Add actions in this order:**
   - **Run Shortcut**: "Sync Deleted Tasks from Google"
   - **Wait**: 1 second (optional, for stability)
   - **Run Shortcut**: "Sync Updated Tasks from Google"
   - **Wait**: 1 second (optional)
   - **Run Shortcut**: "Sync Added Tasks from Google"

3. **Add Show Notification**:
   - Title: "Google Tasks Sync"
   - Body: "Sync completed successfully"

## Part 3: Set Up Automation

### Create Hourly Automation

1. **Go to Automation tab** in Shortcuts app
2. Tap **+** → **Create Personal Automation**
3. Choose **Time of Day**
4. Configure:
   - Time: Choose your start time
   - Repeat: Hourly (or your preference)
   - Starting: Today
5. Tap **Next**
6. **Add Action**: Search for and select "Sync All Google Tasks" shortcut
7. Tap **Next**
8. **IMPORTANT**: Turn OFF "Ask Before Running"
9. Tap **Done**

### Alternative: Multiple Daily Automations

If hourly is too frequent, create multiple automations:
- Morning sync: 8:00 AM
- Noon sync: 12:00 PM
- Afternoon sync: 4:00 PM
- Evening sync: 8:00 PM

## Part 4: Handling SyncId in Apple Reminders

Since Apple Reminders doesn't have custom fields, the syncId must be embedded in the notes:

### Recommended Format

```
[Original task notes]

[SyncID: sync_1234567890_abc123]
```

### Important Considerations

1. **Don't modify the SyncID line** when editing reminders manually
2. **Keep the format consistent** for reliable finding/updating
3. **Consider creating a dedicated list** for synced tasks

## Part 5: Advanced Tips

### Error Handling

Add these checks to make your shortcuts more robust:

1. **Check HTTP status**:
   - After "Get Contents of URL"
   - Add "If" condition to check if response contains "error"
   - Show error notification if true

2. **Check for empty responses**:
   - Before processing tasks/syncIds
   - Skip if count is 0

3. **Add timeout handling**:
   - In URL actions, consider the request might timeout
   - Add retry logic if needed

### Debugging

1. **Use Quick Look**:
   - Add after "Get Contents of URL" to see raw response
   - Helps identify API issues

2. **Add logging**:
   - Use "Add to Note" to log sync operations
   - Create a debug note in Notes app

3. **Test individually**:
   - Run each shortcut manually first
   - Verify each type works before automation

### Performance Optimization

1. **Batch processing**:
   - If you have many tasks, consider processing in smaller batches
   - Add counter and limit processing to 50 items at a time

2. **Selective sync**:
   - Only sync specific lists by filtering in the shortcut
   - Reduces processing time

3. **Skip unchanged items**:
   - For updates, compare timestamps before processing
   - Reduces unnecessary operations

## Example Shortcut Structure (Pseudocode)

### Sync Added Tasks

```
1. URL = "https://your-domain.vercel.app/api/sync/USER_ID?type=added"
2. Response = Get Contents of URL
3. If Response contains "error":
   - Show Error Notification
   - Exit Shortcut
4. Tasks = Get "tasks" from Response
5. TaskCount = Count of Tasks
6. If TaskCount > 0:
   - For Each Task in Tasks:
     a. Title = Get "title" from Task
     b. Notes = Get "notes" from Task
     c. Due = Get "due" from Task
     d. SyncId = Get "syncId" from Task
     e. Status = Get "status" from Task
     
     f. FormattedNotes = Notes + "\n\n[SyncID: " + SyncId + "]"
     
     g. If Due exists:
        - DueDate = Format Due as Date
     
     h. Add New Reminder:
        - Title: Title
        - Notes: FormattedNotes
        - Due Date: DueDate (if exists)
        - List: "Google Tasks Sync"
        - Is Completed: (Status == "completed")
   
   - Show Notification: "Added [TaskCount] tasks"
7. Else:
   - Show Notification: "No new tasks to add"
```

## Troubleshooting

### Common Issues

1. **"No tasks found" when you know there are tasks**
   - Check that tasks have syncIds (only synced tasks are returned)
   - Verify your user ID is correct
   - Ensure you're looking at the right Google account

2. **Reminders not updating**
   - Check the SyncID format in notes is exactly as expected
   - Ensure no extra spaces or characters
   - Try using "contains" filter instead of exact match

3. **Automation not running**
   - Verify "Ask Before Running" is OFF
   - Check iOS Settings > Shortcuts > Allow Untrusted Shortcuts
   - Ensure device is unlocked at automation time
   - Check battery/power saving settings

4. **Duplicate reminders**
   - This might happen if sync is interrupted
   - Add duplicate checking logic using syncId
   - Run delete sync before adding new tasks

### Testing Your Setup

1. **Manual test sequence**:
   - Create a task via webhook API
   - Run "Sync Added Tasks" manually
   - Verify task appears in Reminders
   - Update the task via API
   - Run "Sync Updated Tasks"
   - Verify changes reflected
   - Delete task via API
   - Run "Sync Deleted Tasks"
   - Verify removal

2. **Check sync state**:
   - Use the API to verify sync snapshot is updating
   - Ensure mappings are maintained correctly

## Security Notes

- Your User ID is embedded in shortcuts - keep shortcuts private
- Don't share shortcuts with embedded credentials
- The API handles authentication server-side, so no tokens in shortcuts
- Consider using a separate Google account for testing

## Conclusion

This setup provides automated, bidirectional sync between Google Tasks and Apple Reminders. Start with manual testing of each component before enabling automation. Monitor the first few automated runs to ensure everything works as expected.
