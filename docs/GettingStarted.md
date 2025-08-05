# Getting Started with Sync Flow

This guide will help you set up and run Sync Flow locally for development.

## Prerequisites

- Node.js 18+ or 20+ (LTS recommended)
- pnpm (recommended) or npm
- A Google Cloud Console account
- An Upstash Redis account
- Vercel CLI (for local development)

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sync-flow
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Tasks API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Tasks API"
   - Click "Enable"
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
   - Save the Client ID and Client Secret

### 4. Set Up Upstash Redis

1. Sign up at [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the Redis REST URL and tokens from the dashboard

### 5. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Server Configuration
SERVER_BASE_URL=http://localhost:3000

# Upstash Redis (from your Upstash dashboard)
KV_REST_API_URL=your_upstash_url
KV_REST_API_TOKEN=your_upstash_token
KV_REST_API_READ_ONLY_TOKEN=your_upstash_read_only_token
KV_URL=your_redis_url
REDIS_URL=your_redis_url
```

## Running Locally

### Development Server

Start the Vercel development server:

```bash
pnpm start
# or
npm run start
```

The server will start at `http://localhost:3000`.

### Available Scripts

- `pnpm start` - Start Vercel dev server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm type-check` - Run TypeScript type checking

## Testing the Application

### 1. Authentication Flow

1. Open `http://localhost:3000/api/` in your browser
2. Click "Sign in with Google"
3. Complete the OAuth flow
4. You should see a success page with your user ID

### 2. Testing Webhooks

Create a task using cURL:

```bash
curl -X POST http://localhost:3000/api/webhook/YOUR_USER_ID/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "notes": "This is a test",
    "priority": "High",
    "tags": "test,development"
  }'
```

Update a task:

```bash
curl -X PUT http://localhost:3000/api/webhook/YOUR_USER_ID/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "sync_123456",
    "title": "Updated Task",
    "isCompleted": true
  }'
```

Delete a task:

```bash
curl -X DELETE http://localhost:3000/api/webhook/YOUR_USER_ID/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "syncId": "sync_123456"
  }'
```

### 3. Fetching Updates

```bash
curl http://localhost:3000/api/fetch-updates/YOUR_USER_ID
```

## Troubleshooting

### Common Issues

1. **"Authentication expired" errors**
   - The user needs to re-authenticate through the OAuth flow
   - This happens when refresh tokens expire or are revoked

2. **Redis connection errors**
   - Verify your Upstash credentials are correct
   - Check if your Redis instance is active

3. **Google API errors**
   - Ensure the Google Tasks API is enabled in your project
   - Verify OAuth scopes include Tasks access

### Debug Logging

The application includes comprehensive logging. Check the console output for:
- API request/response details (with sensitive data redacted)
- Token refresh attempts
- Error stack traces

### Development Tips

1. Use the Vercel CLI's hot reloading for faster development
2. Monitor Redis keys using Upstash's data browser
3. Test with real Google Tasks to ensure proper sync
4. Use the browser's network tab to inspect API calls

## Next Steps

- Review the [Architecture](./Architecture.md) to understand the system design
- Check the [API Reference](./API.md) for detailed endpoint documentation
- Read the [Development Guide](./Development.md) for coding standards
