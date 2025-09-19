# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Package Management & Scripts
- `pnpm install` - Install dependencies (preferred over npm)
- `pnpm start` - Start development server (alias for `vercel dev`)
- `pnpm deploy` - Deploy to Vercel
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check if code is formatted
- `pnpm type-check` - Run TypeScript type checking

### Development & Testing
- `vercel dev` - Start local development server with Edge Functions
- `vercel dev --debug` - Start with debug logging for troubleshooting
- No automated tests currently exist - manual testing required

## Architecture Overview

Sync Flow is a serverless API built on Vercel Edge Functions that synchronizes Apple Reminders with Google Tasks. Key architectural patterns:

### Single Edge Function Architecture
- **Entry Point**: `api/index.ts` - Single Hono application serving all routes
- **Runtime**: Edge runtime with global performance
- **Routing**: All routes prefixed with `/api/`
- **Redirect**: Root `/` redirects to `/api/` for landing page

### Service Layer Pattern
The application uses dependency injection with service classes:
- **GoogleAuthService**: OAuth 2.0 flows and token management
- **GoogleTasksService**: Google Tasks API interactions
- **UserService**: User data and Redis operations
- **EmailService**: Resend integration for notifications

### Handler Pattern
Each endpoint has a dedicated handler factory in `src/handlers/`:
- `createLandingPageHandler()` - Landing page with OAuth initiation
- `createAuthHandler()` - OAuth callback processing
- `createCreateTaskWebhookHandler()` - Apple Reminders → Google Tasks
- `createUpdateTaskWebhookHandler()` - Task updates
- `createDeleteTaskWebhookHandler()` - Task deletions
- `createFetchSyncHandler()` - Google Tasks → Apple Reminders
- `createEarlyAccessHandler()` - Beta access request collection
- `createAdminEarlyAccessHandler()` / `createAdminStatsHandler()` - Admin endpoints

### Data Storage
- **Redis (Upstash)**: User tokens, sync mappings, beta requests, rate limiting
- **Key Patterns**:
  - `user:{userId}:tokens` - OAuth tokens
  - `mapping:{userId}:{syncId}` - Apple ↔ Google Task ID mappings
  - `early-access:{email}` - Beta access requests
  - `rate-limit:*` - Rate limiting counters

### Validation & Type Safety
- **Zod schemas** for all API inputs defined in `api/index.ts`
- **TypeScript types** in `src/types/` for domain models
- **Runtime validation** using `@hono/zod-validator`

### Error Handling
- **Custom error classes** in `src/utils/errors.ts` with status codes
- **Global error middleware** in `api/index.ts` for consistent responses
- **Detailed logging** with request context

## Key API Endpoints

### Authentication Flow
- `GET /api/` - Landing page with Google OAuth link
- `GET /api/auth/google/callback` - OAuth callback handler

### Webhook Endpoints (Apple Shortcuts → Google Tasks)
- `POST /api/webhook/{userId}/tasks` - Create task
- `PUT /api/webhook/{userId}/tasks` - Update task
- `DELETE /api/webhook/{userId}/tasks` - Delete task

### Sync Endpoint (Google Tasks → Apple Shortcuts)
- `GET /api/sync/{userId}?type={added|updated|deleted}` - Fetch changes

### Beta Access System
- `POST /api/early-access` - Submit beta access request (rate limited)
- `GET /api/admin/early-access` - View beta requests (requires ADMIN_SECRET)
- `GET /api/admin/stats` - View system stats (requires ADMIN_SECRET)

## Environment Configuration

Required environment variables (see `.env.example`):
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN` - Redis connection
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `RESEND_API_KEY` - Email notifications
- `BETA_NOTIFICATION_TO` & `BETA_NOTIFICATION_FROM` - Beta access emails
- `ADMIN_SECRET` - Admin endpoint protection

## Code Conventions

### File Structure
- `api/index.ts` - Single entry point with all routes and middleware
- `src/handlers/` - Request handler factories
- `src/services/` - Business logic services
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions

### Import Patterns
- External dependencies first (Hono, Zod, etc.)
- Internal types with `type` imports
- Service classes and utilities last

### Error Handling
- Always use custom `SyncFlowError` classes with proper status codes
- Log errors with full context (URL, method, user agent, stack)
- Never expose internal details in API responses

### Data Validation
- All API inputs validated with Zod schemas
- Schema definitions co-located in `api/index.ts`
- Type inference used for TypeScript types

## Testing & Quality

- **No automated tests** - rely on TypeScript and manual testing
- **Always run** `pnpm lint` and `pnpm type-check` before deployment
- **Manual testing workflow**: Use Postman/curl for API endpoints
- **OAuth testing**: Test full authentication flow in browser

## Deployment

- **Platform**: Vercel with Edge Runtime
- **Process**: `pnpm deploy` or auto-deploy via GitHub integration
- **Configuration**: `vercel.json` handles redirects and rewrites
- **Monitoring**: Use Vercel dashboard for function logs and metrics