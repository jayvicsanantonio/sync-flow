# Sync Flow Documentation

## Overview

Sync Flow is a serverless API that enables bidirectional synchronization between Apple Reminders and Google Tasks. Built on Vercel Edge Functions, it provides webhook endpoints for real-time sync and uses OAuth 2.0 for secure Google account integration.

## Quick Links

- [Getting Started](./docs/GettingStarted.md) - Setup and run the project locally
- [Architecture](./docs/Architecture.md) - System design and technical decisions
- [API Reference](./docs/API.md) - Detailed endpoint documentation
- [Deployment](./docs/Deployment.md) - Deploy to production on Vercel
- [Development](./docs/Development.md) - Development workflow and best practices

## Key Features

- **Two-way Sync**: Changes in Apple Reminders sync to Google Tasks and vice versa
- **OAuth 2.0**: Secure Google account integration
- **Metadata Preservation**: Priority, URLs, and tags sync between platforms
- **Automatic Token Refresh**: Seamless authentication experience
- **Real-time Updates**: Webhook-based synchronization
- **Beta Access System**: Email collection with automatic owner notifications
- **Serverless**: Runs on Vercel Edge Functions for global performance

## Technology Stack

- **Runtime**: Node.js on Vercel Edge Functions
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **Language**: TypeScript with ES modules
- **Database**: [Upstash Redis](https://upstash.com/) - Serverless Redis
- **Validation**: [Zod](https://zod.dev/) - Runtime type validation
- **Authentication**: Google OAuth 2.0

## Project Structure

```
sync-flow/
├── api/
│   └── index.ts         # Main API entry point (single Edge Function)
├── src/                 # Source code (imported by API)
│   ├── handlers/        # Request handlers for each endpoint
│   │   ├── auth.ts      # OAuth callback handler
│   │   ├── early-access.ts # Beta access handler
│   │   ├── landing.ts   # Landing page handler
│   │   ├── sync.ts      # Fetch updates handler
│   │   └── webhook.ts   # Task CRUD webhook handlers
│   ├── services/        # Business logic layer
│   │   ├── email.ts     # Email notification service
│   │   ├── google-auth.ts   # Google OAuth service
│   │   ├── google-tasks.ts  # Google Tasks API service
│   │   └── user.ts          # User data service
│   ├── types/           # TypeScript type definitions
│   │   ├── auth.ts      # Authentication types
│   │   ├── google-api.ts # Google API types
│   │   └── user.ts      # User model types
│   └── utils/           # Utility functions
│       ├── errors.ts    # Custom error classes
│       └── rate-limit.ts # Rate limiting utilities
├── scripts/             # Development and admin scripts
│   ├── get-early-access.js  # Export beta requests
│   └── send-test-email.ts   # Test email integration
├── docs/                # Documentation
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vercel.json          # Vercel deployment config
└── eslint.config.js     # Linting configuration
```

## How It Works

1. **Authentication**: Users sign in with Google via OAuth 2.0
2. **Task Creation**: Apple Reminders sends webhook requests to create tasks in Google Tasks
3. **Task Updates**: Changes are synced bidirectionally via webhooks and polling
4. **Metadata Handling**: Apple-specific fields (priority, URLs) are embedded in Google Task notes
5. **Mapping Storage**: Redis maintains sync mappings between Apple syncIds and Google Task IDs

## Beta Access System

SyncFlow includes a built-in beta access request system that:

- **Collects User Interest**: Landing page form captures email addresses
- **Prevents Duplicates**: Redis-based deduplication
- **Owner Notifications**: Automatic email alerts via Resend
- **Admin Dashboard**: View and export beta requests
- **Rate Limited**: Protects against spam (5 requests/hour per IP)

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Required for Resend email notifications
RESEND_API_KEY=re_your-resend-api-key
BETA_NOTIFICATION_TO=owner@yourdomain.com
BETA_NOTIFICATION_FROM="SyncFlow <beta@yourdomain.com>"

# Optional (defaults to enabled)
EMAIL_NOTIFICATIONS_ENABLED=true

# Required for admin endpoints
ADMIN_SECRET=your-secure-admin-secret
```

### Beta Access Scripts

```bash
# View all beta requests
node scripts/get-early-access.js

# Test email integration (requires setup)
npx tsx scripts/send-test-email.ts
```

## Contributing

Please read our [Development Guide](./docs/Development.md) for details on our code standards, development workflow, and the process for submitting pull requests.

## Support

For issues and questions:

- Review the [API Reference](./docs/API.md)
- Examine the [Architecture](./docs/Architecture.md) for design decisions

## License

This project is proprietary software. All rights reserved.
