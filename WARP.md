# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Overview
- Purpose: Serverless API that synchronizes Apple Reminders and Google Tasks bidirectionally.
- Platform: Vercel Edge Functions using Hono (TypeScript, ES Modules).
- Single-function design: One Edge Function handles all routes; app is mounted at /api.
- Storage: Upstash Redis for user tokens, sync mappings, and beta-access data.

Common commands
- Install deps (pnpm is preferred)
  ```bash path=null start=null
  pnpm install
  ```
- Start dev server (Edge runtime)
  ```bash path=null start=null
  pnpm start
  # or with extra logging
  vercel dev --debug
  ```
- Type-check
  ```bash path=null start=null
  pnpm type-check
  ```
- Lint and fix
  ```bash path=null start=null
  pnpm lint
  pnpm lint:fix
  ```
- Format and check formatting
  ```bash path=null start=null
  pnpm format
  pnpm format:check
  ```
- Build locally with Vercel (optional)
  ```bash path=null start=null
  npx vercel build
  ```
- Deploy
  ```bash path=null start=null
  pnpm deploy
  ```

Notes on testing
- There is no automated test suite configured (per CLAUDE.md). Use manual testing during development.
- Example manual test (Create Task webhook):
  ```bash path=null start=null
  curl -X POST http://localhost:3000/api/webhook/YOUR_USER_ID/tasks \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Task",
      "notes": "Example",
      "priority": "High",
      "tags": "demo",
      "url": "https://example.com"
    }'
  ```

Environment configuration (minimal)
- Required to run locally (see docs/GettingStarted.md and docs/Deployment.md for full details):
  - Google OAuth: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - Upstash Redis (used by @upstash/redis via Redis.fromEnv()): UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
  - Optional/feature flags and admin: ADMIN_SECRET, EMAIL_NOTIFICATIONS_ENABLED, RESEND_API_KEY, BETA_NOTIFICATION_TO, BETA_NOTIFICATION_FROM

High-level architecture
- Entry point: api/index.ts
  - Exports Edge runtime config and Hono handler for Vercel.
  - Base path /api with middleware: logger, CORS, and a global error handler that returns standardized JSON errors using SyncFlowError.
  - Zod validation via @hono/zod-validator for params, query, and JSON bodies.
  - Rate limiting: Early access endpoint is limited to 5 requests/hour per IP using an Upstash-backed sliding window (key prefix rate-limit:early-access).
- Major route groups
  - GET /api/ → Landing page + OAuth entry.
  - GET /api/auth/google/callback → OAuth code exchange and user creation/update.
  - Webhooks (Apple → Google): POST/PUT/DELETE /api/webhook/:userId/tasks.
  - Sync (Google → Apple): GET /api/sync/:userId?type=added|updated|deleted.
  - Admin (requires ADMIN_SECRET via Bearer token): GET /api/admin/early-access, GET /api/admin/stats.
- Handler pattern (src/handlers/*)
  - Factory functions that accept service instances and return Hono-compatible handlers. Keeps routing thin and logic isolated.
- Service layer (src/services/*)
  - GoogleAuthService: OAuth token exchange/refresh; user profile.
  - GoogleTasksService: Google Tasks API operations; embeds Apple metadata into notes.
  - UserService: Redis-backed user storage, token lifecycle, and ID mappings.
  - EmailService: Resend integration for beta-access notifications (toggleable via EMAIL_NOTIFICATIONS_ENABLED).
- Types and utilities
  - src/types/*: Domain types for auth, user, and Google API.
  - src/utils/errors.ts: SyncFlowError hierarchy with status codes and machine-readable error codes.
  - src/utils/rate-limit.ts: Upstash-based limiter used by early-access.
- Data/storage conventions (Upstash Redis)
  - User records (tokens + profile + syncedTaskIds).
  - Bidirectional task ID mappings (Apple syncId ↔ Google taskId).
  - Early-access data: per-email JSON objects, plus a set and counters for summaries.
- Metadata embedding (Google Tasks notes)
  - To preserve Apple-only fields (priority, URL, tags), metadata is appended in a structured, human-readable section within the notes. Handlers/services parse and maintain this during create/update flows.

Routing and deployment specifics
- The Hono app is mounted at /api; vercel.json ensures / redirects to /api and rewrites /api/* → /api (single function).
- Edge runtime is configured via export const config = { runtime: 'edge' } in api/index.ts.

What to read first (for deeper context)
- README.md → Quick links and feature overview.
- docs/Architecture.md → Big-picture design (single Edge Function, handlers/services pattern, metadata strategy).
- docs/API.md → Endpoint semantics and payloads.
- CLAUDE.md → Consolidated commands, route map, and environment variable summary; also notes that there is no automated test suite.
