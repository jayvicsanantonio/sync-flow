# Beta Access System Deployment Checklist

## Overview

This document outlines the steps required to deploy the beta access functionality with Upstash Redis and Resend email integration.

## Pre-deployment Setup

### 1. Resend Configuration

1. **Create Resend Account**: Visit [resend.com](https://resend.com) and sign up
2. **Generate API Key**:
   - Go to Dashboard → API Keys
   - Create a new API key with send permissions
   - Copy the key (starts with `re_`)
3. **Verify Domain**:
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps
   - Or use Resend's sandbox domain for testing

### 2. Environment Variables Setup

#### For Vercel Production:

```bash
vercel env add RESEND_API_KEY
# Paste your Resend API key when prompted

vercel env add BETA_NOTIFICATION_TO
# Enter your email address where notifications should be sent

vercel env add BETA_NOTIFICATION_FROM
# Format: "SyncFlow <beta@yourdomain.com>"
# Must use verified domain or Resend sandbox

vercel env add ADMIN_SECRET
# Generate secure random string for admin endpoints

vercel env add EMAIL_NOTIFICATIONS_ENABLED
# Set to "true" for production
```

#### For Local Development:

Update `.env.development.local`:

```bash
RESEND_API_KEY="re_your-actual-api-key"
BETA_NOTIFICATION_TO="your-email@domain.com"
BETA_NOTIFICATION_FROM="SyncFlow <beta@yourdomain.com>"
EMAIL_NOTIFICATIONS_ENABLED="false"  # Disable for local testing
ADMIN_SECRET="your-secure-admin-secret"
```

## Deployment Steps

### 1. Deploy to Vercel

```bash
pnpm deploy
```

### 2. Test the Integration

#### Test Email System:

```bash
# Set email notifications to true in env
EMAIL_NOTIFICATIONS_ENABLED="true" pnpm test:email
```

#### Test Beta Access Flow:

1. Visit your deployed site
2. Click "Request Beta Access"
3. Submit a test email
4. Check that:
   - User receives success message
   - You receive notification email
   - Request appears in Redis

#### Verify Admin Endpoints:

```bash
# Get bearer token (your ADMIN_SECRET)
curl -H "Authorization: Bearer your-admin-secret" \
     https://your-site.vercel.app/api/admin/early-access

curl -H "Authorization: Bearer your-admin-secret" \
     https://your-site.vercel.app/api/admin/stats
```

### 3. Monitor and Validate

#### Check Redis Data:

```bash
pnpm beta:export
```

#### Monitor Logs:

- Check Vercel function logs for email send confirmations
- Look for any error patterns in the logs

## API Endpoints Summary

| Endpoint                  | Method | Purpose                              |
| ------------------------- | ------ | ------------------------------------ |
| `/api/early-access`       | POST   | Submit beta access request           |
| `/api/admin/early-access` | GET    | View all requests (requires auth)    |
| `/api/admin/stats`        | GET    | Get basic statistics (requires auth) |

## Rate Limiting

- **Early Access**: 5 requests per hour per IP address
- **Admin Endpoints**: No rate limiting (protected by auth token)

## Data Storage Structure

### Redis Keys:

- `early-access:{email}` - Individual request data (JSON)
- `early-access:list` - Set of all email addresses
- `early-access:count` - Total request counter

### Example Data:

```json
{
  "email": "user@example.com",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## Troubleshooting

### Email Not Sending

1. Check `RESEND_API_KEY` is valid and active
2. Verify `BETA_NOTIFICATION_FROM` uses verified domain
3. Check Vercel function logs for error details
4. Test with `pnpm test:email` locally

### Redis Connection Issues

1. Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
2. Check Redis instance is active in Upstash dashboard
3. Test connection with `pnpm beta:export`

### Admin Access Issues

1. Verify `ADMIN_SECRET` is set correctly
2. Use Bearer token format: `Authorization: Bearer your-secret`
3. Check admin endpoints return JSON responses

## Security Considerations

- **API Keys**: Never commit Resend API key to version control
- **Admin Secret**: Use cryptographically random string (min 32 chars)
- **Email Domain**: Always verify your sender domain with Resend
- **Rate Limiting**: Monitor for abuse, adjust limits if needed

## Post-deployment Tasks

1. **Update Project Documentation**: Add email configuration details
2. **Set Up Monitoring**: Track email delivery rates and error patterns
3. **Test Notification Flow**: Submit test beta request and verify email delivery
4. **Document Admin Procedures**: How to review and respond to beta requests
