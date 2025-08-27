# 🚀 SyncFlow Resend Email Setup Guide

Follow these steps to complete your beta access email integration.

## ✅ Already Done
- ✅ Resend SDK installed (`pnpm add resend`)
- ✅ Email service created (`api/services/email.ts`)
- ✅ Integration wired into early access handler
- ✅ Admin secret generated: `ede6e7d71267507ca59d1919f42b66dc6cf8f22bea35b297e5cb8ed7c1ec9155`

## 🔧 Steps to Complete

### 1. Create Resend Account (2 minutes)

1. **Visit**: [https://resend.com](https://resend.com)
2. **Sign up** with your email 
3. **Verify** your email address
4. **Complete** any onboarding steps

### 2. Get Your API Key (1 minute)

1. In Resend dashboard, go to **API Keys**
2. Click **"Create API Key"**
3. Name: `SyncFlow Beta Notifications`
4. Permissions: **"Sending access"**
5. **Copy** the API key (starts with `re_`)

### 3. Update Local Environment (1 minute)

Edit your `.env.development.local` file and replace:

```bash
# Replace this line:
RESEND_API_KEY="re_your-resend-api-key"
# With your actual API key:
RESEND_API_KEY="re_your_actual_key_here"

# Replace this line:
BETA_NOTIFICATION_TO="your-email@domain.com"  
# With your actual email:
BETA_NOTIFICATION_TO="your-actual-email@gmail.com"

# Leave this as-is for now (uses Resend test domain):
BETA_NOTIFICATION_FROM="SyncFlow <onboarding@resend.dev>"
```

### 4. Test Local Setup (1 minute)

```bash
# Enable email notifications for testing
EMAIL_NOTIFICATIONS_ENABLED="true" pnpm test:email
```

If successful, you'll see:
```
✅ Test email sent successfully!
   Email ID: 550e8400-e29b-41d4-a716-446655440000
   Recipient: your-actual-email@gmail.com
   Sender: SyncFlow <onboarding@resend.dev>
```

**Check your inbox** - you should receive a test email!

### 5. Configure Vercel Production (3 minutes)

Run these commands and enter the prompted values:

```bash
# 1. Set your Resend API key
vercel env add RESEND_API_KEY
# Enter: re_your_actual_key_here

# 2. Set your notification email  
vercel env add BETA_NOTIFICATION_TO
# Enter: your-actual-email@gmail.com

# 3. Set sender email
vercel env add BETA_NOTIFICATION_FROM  
# Enter: SyncFlow <onboarding@resend.dev>

# 4. Enable emails in production
vercel env add EMAIL_NOTIFICATIONS_ENABLED
# Enter: true

# 5. Set admin secret
vercel env add ADMIN_SECRET
# Enter: ede6e7d71267507ca59d1919f42b66dc6cf8f22bea35b297e5cb8ed7c1ec9155
```

### 6. Deploy & Test Production (2 minutes)

```bash
# Deploy to Vercel
pnpm deploy

# Test the live site
# Visit your deployed URL and submit a beta request
```

## 🎯 Quick Start Commands

```bash
# Test email integration locally
EMAIL_NOTIFICATIONS_ENABLED="true" pnpm test:email

# View current beta requests
pnpm beta:export  

# Start development server
pnpm start
```

## 🔍 Verification Checklist

- [ ] Resend account created and verified
- [ ] API key copied from Resend dashboard  
- [ ] Local `.env.development.local` updated with real values
- [ ] Test email sent successfully (`pnpm test:email`)
- [ ] Test email received in your inbox
- [ ] Vercel environment variables configured
- [ ] Production deployment successful
- [ ] Live beta access form tested

## 🚨 Troubleshooting

### Email Test Fails
```bash
❌ Error: Missing RESEND_API_KEY environment variable
```
**Solution**: Make sure you've updated `.env.development.local` with your real API key

### "Domain not verified" Error
```bash
❌ Error: Domain not verified
```
**Solution**: Use `onboarding@resend.dev` as sender initially, or verify your domain in Resend

### No Email Received  
1. Check spam/junk folder
2. Verify the `BETA_NOTIFICATION_TO` email address is correct
3. Check Vercel function logs for errors

## 📧 Email Domain Options

### Option 1: Resend Test Domain (Recommended for Start)
```bash
BETA_NOTIFICATION_FROM="SyncFlow <onboarding@resend.dev>"
```
- ✅ Works immediately
- ✅ No setup required  
- ⚠️ Limited to 100 emails/day
- ⚠️ "via resend.dev" in sender

### Option 2: Your Own Domain (For Production)
1. **Add Domain** in Resend dashboard
2. **Add DNS Records** to your domain provider:
   ```
   TXT _resend.<your-domain> 4000 "resend-verification-code"
   ```
3. **Wait for Verification** (5-10 minutes)
4. **Update Sender**:
   ```bash
   BETA_NOTIFICATION_FROM="SyncFlow <beta@yourdomain.com>"
   ```

## 🎉 Success!

Once everything is working, you'll have:

- ✅ **Automatic Email Notifications**: You'll be notified instantly when users request beta access
- ✅ **Professional Emails**: Clean HTML templates with user details
- ✅ **Reliable Storage**: All requests saved to Upstash Redis  
- ✅ **Admin Dashboard**: View and export all beta requests
- ✅ **Rate Protection**: Prevents spam (5 requests/hour per IP)

Your beta access system is now production-ready! 🚀
