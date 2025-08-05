# Deployment Guide

This guide covers deploying Sync Flow to production using Vercel's serverless platform.

## Prerequisites

### 1. Accounts Required

- **Vercel Account**: Sign up at [vercel.com](https://vercel.com/)
- **Google Cloud Console**: For OAuth credentials
- **Upstash Account**: For Redis database

### 2. Google OAuth Setup for Production

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Update your OAuth client settings:
   - Add production redirect URI: `https://your-domain.vercel.app/api/auth/google/callback`
   - Add your production domain to authorized JavaScript origins
3. Keep development redirect URI for local testing

### 3. Prepare Your Repository

- Ensure all code is committed to Git
- Remove any `.env` files from version control
- Verify `.gitignore` includes environment files

## Deployment Methods

### Method 1: Vercel CLI (Recommended for First Deployment)

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

   - Follow the prompts
   - Link to existing project or create new
   - Configure environment variables when prompted

### Method 2: GitHub Integration

#### 1. Import Project

1. Navigate to the Vercel Dashboard.
2. Click on "New Project".
3. Select your Git repository (e.g., GitHub, GitLab, Bitbucket).

#### 2. Set Environment Variables

1. In your Vercel dashboard, navigate to your project settings.
2. Click on "Environment Variables".
3. Add the following variables:
   - **GOOGLE_CLIENT_ID:** Your Google OAuth Client ID
   - **GOOGLE_CLIENT_SECRET:** Your Google OAuth Client Secret
   - **SERVER_BASE_URL:** The base URL of your Vercel project
   - **KV_REST_API_URL:** Upstash Redis REST API URL
   - **KV_REST_API_TOKEN:** Upstash Redis REST API Token
   - **KV_REST_API_READ_ONLY_TOKEN:** Upstash Redis Read-Only Token
   - **KV_URL:** Redis connection URL
   - **REDIS_URL:** Redis connection URL

_Note: For security reasons, ensure these values are not exposed publicly._

#### 3. Configure Vercel

1. Ensure the `vercel.json` configuration file is present:

   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api"
       }
     ]
   }
   ```

2. This file ensures all API requests are routed correctly.

#### 4. Set Build and Output Settings

1. In your project settings, configure your build command:
   - You can generally rely on this being inferred via `package.json`, but custom commands, can be set if extensions are added.

#### 5. Deploy

1. Click "Deploy" in the Vercel dashboard.
2. The deployment will automatically build your project.

## Post-Deployment Configuration

### 1. Update Google OAuth Redirect URI

After deployment, update your Google OAuth settings:

1. Copy your production URL from Vercel (e.g., `https://sync-flow.vercel.app`)
2. In Google Cloud Console, add: `https://sync-flow.vercel.app/api/auth/google/callback`
3. Update `SERVER_BASE_URL` environment variable in Vercel to match

### 2. Verify Deployment

1. **Test Authentication**

   ```bash
   curl https://your-domain.vercel.app/api/
   ```

   Should return the HTML landing page

2. **Complete OAuth Flow**
   - Visit `https://your-domain.vercel.app/api/`
   - Click "Sign in with Google"
   - Verify successful authentication

3. **Test API Endpoints**
   ```bash
   # Create a test task
   curl -X POST https://your-domain.vercel.app/api/webhook/YOUR_USER_ID/tasks \
     -H "Content-Type: application/json" \
     -d '{"title": "Production Test"}'
   ```

## Production Environment Variables

### Required Variables

| Variable               | Description             | Example                                    |
| ---------------------- | ----------------------- | ------------------------------------------ |
| `GOOGLE_CLIENT_ID`     | OAuth 2.0 client ID     | `123456789.apps.googleusercontent.com`     |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret | `GOCSPX-xxxxx`                             |
| `SERVER_BASE_URL`      | Your production URL     | `https://sync-flow.vercel.app`             |
| `KV_REST_API_URL`      | Upstash REST endpoint   | `https://xxx.upstash.io`                   |
| `KV_REST_API_TOKEN`    | Upstash API token       | `AxxxAAIjcDEz...`                          |
| `REDIS_URL`            | Redis connection URL    | `rediss://default:xxx@xxx.upstash.io:6379` |

### Environment-Specific Settings

Vercel allows different variables for different environments:

- **Production**: Main deployment
- **Preview**: Pull request deployments
- **Development**: Local development

## Monitoring and Maintenance

### 1. Vercel Dashboard

- **Functions Tab**: Monitor API performance and errors
- **Analytics**: Track usage patterns
- **Logs**: Real-time function logs

### 2. Upstash Dashboard

- Monitor Redis usage and performance
- Set up alerts for usage thresholds
- Use data browser to inspect stored data

### 3. Error Monitoring

The application logs comprehensive error information:

- API request/response details
- Token refresh attempts
- Google API errors

Check logs regularly for:

```bash
# View recent logs
vercel logs --follow
```

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] Google OAuth redirect URIs updated
- [ ] Redis connection verified
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Error logging tested
- [ ] API endpoints validated
- [ ] Authentication flow tested

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure production URL matches exactly in Google Console
   - Check for trailing slashes

2. **Redis connection failures**
   - Verify Upstash credentials
   - Check if Redis instance is active

3. **Function timeouts**
   - Edge Functions have a 30-second timeout
   - Optimize long-running operations

4. **CORS errors**
   - Verify CORS middleware is properly configured
   - Check allowed origins

## Scaling Considerations

1. **Edge Functions**: Automatically scale based on demand
2. **Redis Limits**: Monitor Upstash usage for:
   - Request limits
   - Storage limits
   - Concurrent connections
3. **Google API Quotas**: Monitor Tasks API usage

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Google OAuth credentials
   - Redis tokens

2. **Monitor Access Logs**
   - Check for unusual patterns
   - Set up alerts for errors

3. **Keep Dependencies Updated**
   ```bash
   pnpm update
   pnpm audit
   ```

## Continuous Deployment

With GitHub integration, every push to main triggers:

1. Automatic deployment to production
2. Preview deployments for pull requests
3. Rollback capability for failed deployments

---

Your Sync Flow application is now deployed and ready for production use! Monitor the deployment regularly and scale resources as needed.
