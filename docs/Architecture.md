# Architecture of Sync Flow

## Overview

Sync Flow is a serverless application built on Vercel Edge Functions that provides bidirectional synchronization between Apple Reminders and Google Tasks. The architecture emphasizes scalability, security, and maintainability through modular design and clear separation of concerns.

## System Architecture

### High-Level Components

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│ Apple Reminders │◀────▶│  Sync Flow API   │◀────▶│  Google Tasks   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                   │
                                   ▼
                         ┌──────────────────┐
                         │  Upstash Redis   │
                         └──────────────────┘
```

### Core Components

#### 1. API Layer (Hono Framework)

- **Route Management**: Centralized route definitions in `/api/index.ts`
- **Middleware Stack**:
  - CORS handling for cross-origin requests
  - Request/response logging via `hono/logger`
  - Global error handling middleware
- **Request Validation**: Zod schemas validate all incoming data
- **Edge Runtime**: Optimized for Vercel Edge Functions

#### 2. Handler Layer

- **Factory Pattern**: All handlers use factory functions accepting service dependencies
- **Handlers**:
  - `home.ts`: Serves OAuth login page with inline styles
  - `auth.ts`: Processes OAuth callbacks and user registration
  - `webhook.ts`: Handles task CRUD operations from Apple Reminders
  - `sync.ts`: Provides polling endpoint for fetching updates

#### 3. Service Layer

- **GoogleAuthService**:
  - OAuth token exchange and refresh
  - User profile fetching
  - Automatic token renewal (60 seconds before expiry)
- **GoogleTasksService**:
  - Complete Google Tasks API integration
  - Metadata embedding/extraction in notes field
  - Pagination support for large task lists
  - Task mapping repair functionality
- **UserService**:
  - User data persistence in Redis
  - Task mapping management (bidirectional)
  - Access token retrieval with automatic refresh

#### 4. Data Storage (Upstash Redis)

- **Key Patterns**:
  - `user:{userId}` - User object with tokens and profile
  - `taskmap:{userId}:sync:{syncId}` - Maps syncId to Google Task ID
  - `taskmap:{userId}:google:{googleTaskId}` - Reverse mapping
- **Data Models**: JSON serialized objects
- **Connection**: Environment-based configuration via `Redis.fromEnv()`

## Data Flow Patterns

### Authentication Flow

1. User clicks "Sign in with Google" on landing page
2. Redirect to Google OAuth consent screen with scopes:
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/tasks`
3. Google redirects back with authorization code
4. Exchange code for tokens (access + refresh)
5. Store user data in Redis with expiry tracking

### Task Creation Flow (Apple → Google)

1. Apple Reminders sends POST to `/api/webhook/:userId/tasks`
2. Validate request body with Zod schema
3. Retrieve user's access token (auto-refresh if needed)
4. Build task with embedded metadata in notes:

   ```
   Original notes content

   --- Metadata ---
   Priority: High
   URL: https://example.com
   Tags: work, urgent
   SyncID: sync_1234567890
   ```

5. Create task via Google Tasks API
6. Store bidirectional mapping in Redis
7. Return task details to Apple Reminders

### Task Update Flow

1. Apple Reminders sends PUT with syncId
2. Look up Google Task ID from Redis mapping
3. Fetch existing task to preserve metadata
4. Merge updates while maintaining metadata structure
5. Update task via Google API
6. Return success response

### Sync Flow (Google → Apple)

1. Apple Reminders polls `/api/fetch-updates/:userId`
2. Query Google Tasks API with `updatedMin` parameter
3. Filter tasks already synced (check syncedTaskIds)
4. Extract metadata from task notes
5. Update last sync timestamp
6. Return new/updated tasks

## Key Design Decisions

### 1. Metadata Embedding Strategy

**Problem**: Google Tasks API lacks fields for priority, URLs, and tags that Apple Reminders supports.

**Solution**: Embed metadata in notes field with structured format:

- Preserves data integrity during sync
- Allows bidirectional metadata flow
- Human-readable format
- Easy to parse and update

### 2. Token Management Architecture

**Implementation**:

```typescript
// Automatic refresh 60 seconds before expiry
if (now >= expiresAt - 60000) {
  const newTokens = await refreshTokens();
  // Preserve refresh token if not returned
  if (!newTokens.refresh_token) {
    newTokens.refresh_token = user.tokens.refresh_token;
  }
}
```

### 3. Error Handling Hierarchy

```
SyncFlowError (base)
├── AuthenticationError (401)
├── ValidationError (400)
├── NotFoundError (404)
└── GoogleAPIError (varies)
```

### 4. Dependency Injection Pattern

```typescript
// Factory functions for all handlers
export function createAuthHandler(
  googleAuthService: GoogleAuthService,
  userService: UserService
) {
  return async function handleGoogleCallback(c: Context) {
    // Handler implementation
  };
}
```

### 5. Redis Key Design

- Namespaced keys prevent collisions
- Bidirectional mappings enable fast lookups
- User data stored as JSON for flexibility

## Sequence Diagram

Here is a high-level sequence diagram representing the flow during a typical sync operation:

```plaintext
title Apple Reminders to Google Tasks Sync

participant Apple Reminders as Apple
participant Sync Flow API as API
participant UserService as User Service
participant GoogleTasksService as Tasks Service
participant Redis as Upstash Redis

Apple->API: POST /api/webhook/:userId/tasks
API->UserService: Validate Task Request
UserService->Redis: Retrieve User 6 Token
API->Tasks Service: Create/Update/Delete Task
Tasks Service->GoogleTasksService: Sync Task with Google
GoogleTasksService->Redis: Update Task Mapping
API->Apple: ACK 201 Created
```

The above flow shows how a task is processed from receipt by the API through updating Google's server and reflecting this in Redis.

## Future Considerations

1. **Conflict Resolution**: Introduce mechanisms for detecting and resolving conflicting updates.
2. **Rate Limiting**: Implement efficient request throttling to prevent usage spikes.
3. **Monitoring**: Integrate logging and monitoring tools for real-time analytics.
4. **Testing**: Create a comprehensive suite of unit and integration tests.

## Conclusion

Sync Flow is a future-ready, scalable application, designed for robust and efficient task synchronization. As the project evolves, continued enhancements and refactoring will maintain its responsiveness and reliability.
