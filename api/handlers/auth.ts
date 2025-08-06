import type { Context } from 'hono';
import type { GoogleAuthService } from '../services/google-auth';
import type { UserService } from '../services/user';
import type { User } from '../types/user';

export function createAuthHandler(
  googleAuthService: GoogleAuthService,
  userService: UserService
) {
  return async function handleGoogleCallback(
    c: Context<any, any, { out: { query: { code: string } } }>
  ) {
    const { code } = c.req.valid('query');

    try {
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      const userProfile = await googleAuthService.getUserProfile(
        tokens.access_token
      );

      const id = userProfile.id;
      const existingUser = await userService.getUserById(id);

      if (tokens.expires_in) {
        tokens.expires_at = Date.now() + tokens.expires_in * 1000;
      }

      const user: User = {
        id,
        tokens,
        syncedTaskIds: existingUser?.syncedTaskIds || [],
        profile: {
          email: userProfile.email,
          name: userProfile.name,
          given_name: userProfile.given_name,
          family_name: userProfile.family_name,
          picture: userProfile.picture,
        },
      };

      await userService.saveUser(user);

      return c.html(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sync Flow - Connected</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          /* Vercel Geist Design System */
          :root {
            /* Colors */
            --geist-background: #000;
            --geist-foreground: #fff;
            --geist-background-secondary: #111;
            --geist-foreground-secondary: #888;
            --geist-foreground-tertiary: #666;
            --geist-border: #333;
            --geist-border-hover: #555;
            
            /* Accent colors */
            --geist-accent: #0070f3;
            --geist-accent-hover: #0366d6;
            --geist-accent-light: rgba(0, 112, 243, 0.1);
            --geist-success: #0cce6b;
            --geist-success-light: rgba(12, 206, 107, 0.1);
            --geist-error: #ff0000;
            --geist-warning: #f5a623;
            
            /* Shadows */
            --geist-shadow-small: 0 5px 10px rgba(0, 0, 0, 0.12);
            --geist-shadow-medium: 0 8px 30px rgba(0, 0, 0, 0.12);
            --geist-shadow-large: 0 30px 60px rgba(0, 0, 0, 0.12);
            
            /* Spacing */
            --geist-gap: 16px;
            --geist-gap-half: 8px;
            --geist-gap-quarter: 4px;
            --geist-gap-double: 32px;
            --geist-page-margin: 24px;
            
            /* Typography */
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            --font-mono: 'Menlo', 'Monaco', 'Lucida Console', 'Liberation Mono', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', 'Courier New', monospace;
          }
          
          * {
            box-sizing: border-box;
          }
          
          body {
            font-family: var(--font-sans);
            font-size: 14px;
            line-height: 1.7;
            color: var(--geist-foreground);
            background-color: var(--geist-background);
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          
          .container {
            max-width: 440px;
            width: 100%;
            margin: 0 auto;
            padding: var(--geist-page-margin);
          }
          
          .card {
            background: var(--geist-background-secondary);
            border: 1px solid var(--geist-border);
            border-radius: 8px;
            padding: var(--geist-gap-double);
            box-shadow: var(--geist-shadow-medium);
          }
          
          .success-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto var(--geist-gap);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--geist-success-light);
            border-radius: 50%;
          }
          
          .success-icon svg {
            width: 24px;
            height: 24px;
            stroke: var(--geist-success);
            stroke-width: 3;
          }
          
          h1 {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0 0 var(--geist-gap-half) 0;
            text-align: center;
          }
          
          .welcome {
            font-size: 16px;
            color: var(--geist-foreground);
            text-align: center;
            margin: 0 0 var(--geist-gap-double) 0;
          }
          
          .user-avatar {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            margin: 0 auto var(--geist-gap);
            display: block;
            border: 2px solid var(--geist-border);
          }
          
          .info-section {
            background: var(--geist-background);
            border: 1px solid var(--geist-border);
            border-radius: 6px;
            padding: var(--geist-gap);
            margin-bottom: var(--geist-gap);
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: var(--geist-gap-half) 0;
          }
          
          .info-row:not(:last-child) {
            border-bottom: 1px solid var(--geist-border);
          }
          
          .info-label {
            font-size: 12px;
            color: var(--geist-foreground-tertiary);
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          
          .info-value {
            font-size: 14px;
            font-family: var(--font-mono);
            color: var(--geist-foreground-secondary);
            word-break: break-all;
          }
          
          .next-steps {
            margin-top: var(--geist-gap-double);
          }
          
          .next-steps-title {
            font-size: 14px;
            font-weight: 600;
            margin: 0 0 var(--geist-gap) 0;
            color: var(--geist-foreground);
          }
          
          .step {
            display: flex;
            align-items: flex-start;
            gap: var(--geist-gap-half);
            margin-bottom: var(--geist-gap-half);
            font-size: 14px;
            color: var(--geist-foreground-secondary);
          }
          
          .step-icon {
            color: var(--geist-success);
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          @media (max-width: 600px) {
            .container {
              padding: var(--geist-gap);
            }
            
            .card {
              padding: var(--geist-gap);
            }
            
            h1 {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="success-icon">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h1>Connected Successfully</h1>
            <p class="welcome">Welcome back, <strong>${userProfile.name}</strong></p>
            
            ${userProfile.picture ? `<img src="${userProfile.picture}" alt="User avatar" class="user-avatar">` : ''}
            
            <div class="info-section">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">${userProfile.email}</span>
              </div>
              <div class="info-row">
                <span class="info-label">User ID</span>
                <span class="info-value">${id}</span>
              </div>
            </div>
            
            <div class="next-steps">
              <h3 class="next-steps-title">What's next?</h3>
              <div class="step">
                <span class="step-icon">✓</span>
                <span>Your Google account is now connected to Sync Flow</span>
              </div>
              <div class="step">
                <span class="step-icon">✓</span>
                <span>Apple Reminders will automatically sync with Google Tasks</span>
              </div>
              <div class="step">
                <span class="step-icon">✓</span>
                <span>Use the webhook endpoint to trigger manual syncs</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
      `);
    } catch (error) {
      console.error('Authentication error:', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      return c.html(
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta name="description" content="SyncFlow - Authentication failed. Please try again to sync your tasks.">
        <title>SyncFlow - Authentication Failed</title>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            /* BuildUI-inspired Color Palette - matching landing.ts */
            --background: #fafafa;
            --foreground: #09090b;
            --card: #ffffff;
            --card-foreground: #09090b;
            --muted: #f4f4f5;
            --muted-foreground: #71717a;
            --border: #e4e4e7;
            
            /* Primary Purple Gradient */
            --primary: #8b5cf6;
            --primary-light: #a78bfa;
            --primary-dark: #7c3aed;
            --primary-gradient: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            --primary-gradient-hover: linear-gradient(135deg, #7c3aed 0%, #db2777 100%);
            
            /* Accent Colors */
            --accent: #ec4899;
            --accent-light: #f9a8d4;
            --accent-dark: #db2777;
            
            /* Status Colors */
            --success: #10b981;
            --warning: #f59e0b;
            --error: #ef4444;
            --info: #3b82f6;
            
            /* Gray Scale */
            --gray-50: #fafafa;
            --gray-100: #f4f4f5;
            --gray-200: #e4e4e7;
            --gray-300: #d4d4d8;
            --gray-400: #a1a1aa;
            --gray-500: #71717a;
            --gray-600: #52525b;
            --gray-700: #3f3f46;
            --gray-800: #27272a;
            --gray-900: #18181b;
            
            /* Spacing */
            --gap-quarter: 4px;
            --gap-half: 8px;
            --gap: 16px;
            --gap-double: 32px;
            --gap-triple: 48px;
            --page-margin: 24px;
            --page-width: 1280px;
            --breakpoint-mobile: 640px;
            --breakpoint-tablet: 1024px;
            
            /* Typography */
            --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            --font-mono: 'JetBrains Mono', 'SFMono-Regular', 'Consolas', monospace;
            --line-height: 1.5;
            --line-height-large: 1.8;
            
            /* Shadows */
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
            --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
            --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);
            
            /* Borders */
            --radius-sm: 6px;
            --radius: 8px;
            --radius-md: 12px;
            --radius-lg: 16px;
            --radius-xl: 24px;
            --radius-full: 9999px;
          }
          
          html {
            scroll-behavior: smooth;
          }
          
          body {
            font-family: var(--font-sans);
            font-size: 15px;
            background: var(--background);
            color: var(--foreground);
            line-height: var(--line-height-large);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
          }
          
          /* Background gradient orbs - matching landing.ts */
          .hero-gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.3;
          }
          
          .orb-1 {
            width: 600px;
            height: 600px;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            top: -200px;
            right: -100px;
            animation: orb-float-1 20s ease-in-out infinite;
          }
          
          .orb-2 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            bottom: -150px;
            left: -100px;
            animation: orb-float-2 15s ease-in-out infinite;
          }
          
          @keyframes orb-float-1 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(-50px, 50px) scale(1.1); }
          }
          
          @keyframes orb-float-2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -30px) scale(0.9); }
          }
          
          .container {
            max-width: 480px;
            width: 100%;
            margin: 0 auto;
            padding: var(--page-margin);
            position: relative;
            z-index: 1;
          }
          
          .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-lg);
            padding: var(--gap-triple);
            box-shadow: var(--shadow-xl);
            position: relative;
            text-align: center;
            animation: fadeInUp 0.3s ease-out;
          }
          
          @keyframes fadeInUp {
            from { 
              opacity: 0; 
              transform: translateY(20px);
            }
            to { 
              opacity: 1; 
              transform: translateY(0);
            }
          }
          
          .error-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 6px 4px 16px;
            background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
            border: 1px solid rgba(239, 68, 68, 0.2);
            border-radius: 50px;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .error-badge-icon {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
            color: white;
            border-radius: 50px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          h1 {
            font-size: clamp(2rem, 4vw, 2.5rem);
            font-weight: 800;
            letter-spacing: -0.03em;
            margin: 0 0 var(--gap) 0;
            color: var(--foreground);
            line-height: 1.1;
          }
          
          .error-gradient {
            background: linear-gradient(135deg, #ef4444 0%, #f59e0b 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: inline-block;
          }
          
          .description {
            font-size: 16px;
            color: var(--muted-foreground);
            margin: 0 0 var(--gap-double) 0;
            line-height: 1.6;
            max-width: 420px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .error-details-card {
            background: var(--gray-50);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: var(--gap-double);
            margin: var(--gap-double) 0;
            text-align: left;
          }
          
          .error-details-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--foreground);
            margin-bottom: var(--gap);
            display: flex;
            align-items: center;
            gap: var(--gap-half);
          }
          
          .possible-causes {
            display: flex;
            flex-direction: column;
            gap: var(--gap-half);
          }
          
          .cause-item {
            display: flex;
            align-items: flex-start;
            gap: var(--gap-half);
            padding: var(--gap-half) var(--gap);
            background: var(--card);
            border-radius: var(--radius);
            border: 1px solid var(--border);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .cause-item:hover {
            border-color: var(--primary-light);
            transform: translateX(4px);
          }
          
          .cause-icon {
            color: var(--warning);
            flex-shrink: 0;
            margin-top: 2px;
          }
          
          .cause-text {
            font-size: 14px;
            color: var(--muted-foreground);
            line-height: 1.5;
          }
          
          .buttons {
            display: flex;
            gap: var(--gap);
            margin-top: var(--gap-double);
            flex-wrap: wrap;
          }
          
          .button {
            flex: 1;
            min-width: 140px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-half);
            padding: 14px 28px;
            background: var(--primary-gradient);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
              0 4px 14px 0 rgba(139, 92, 246, 0.35),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            cursor: pointer;
            border: none;
          }
          
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 20px 0 rgba(139, 92, 246, 0.45),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          }
          
          .button-secondary {
            background: var(--card);
            color: var(--foreground);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-sm);
          }
          
          .button-secondary:hover {
            background: var(--muted);
            border-color: var(--primary-light);
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
          }
          
          .technical-details {
            margin-top: var(--gap-double);
            padding: var(--gap);
            background: var(--gray-50);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--gray-600);
            word-break: break-all;
            text-align: left;
          }
          
          .technical-label {
            font-family: var(--font-sans);
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--gray-500);
            margin-bottom: var(--gap-quarter);
          }
            
            @media (max-width: 600px) {
              .container {
                padding: var(--gap);
              }
              
              .card {
                padding: var(--gap-double);
              }
              
              h2 {
                font-size: 24px;
              }
              
              .buttons {
                flex-direction: column;
              }
              
              .button {
                width: 100%;
              }
            }
        </style>
      </head>
      <body>
        <!-- Background gradient orbs - matching landing.ts -->
        <div class="hero-gradient-orb orb-1"></div>
        <div class="hero-gradient-orb orb-2"></div>
        
        <div class="container">
          <div class="card">
            <!-- Error Badge -->
            <div class="error-badge">
              <span>Authentication Issue</span>
              <span class="error-badge-icon">
                <iconify-icon icon="ph:warning-bold" width="12"></iconify-icon>
                ERROR
              </span>
            </div>
            
            <h1>
              <span class="error-gradient">Oops!</span> Something went wrong
            </h1>
            
            <p class="description">
              We couldn't complete the authentication process with Google. 
              Don't worry, this is usually a temporary issue.
            </p>
            
            <!-- Error Details Card -->
            <div class="error-details-card">
              <div class="error-details-title">
                <iconify-icon icon="ph:info" width="16" style="color: var(--info);"></iconify-icon>
                Possible causes
              </div>
              <div class="possible-causes">
                <div class="cause-item">
                  <iconify-icon icon="ph:x-circle" width="16" class="cause-icon"></iconify-icon>
                  <span class="cause-text">You cancelled the authorization request</span>
                </div>
                <div class="cause-item">
                  <iconify-icon icon="ph:timer" width="16" class="cause-icon"></iconify-icon>
                  <span class="cause-text">The authorization code expired (try again quickly)</span>
                </div>
                <div class="cause-item">
                  <iconify-icon icon="ph:wifi-slash" width="16" class="cause-icon"></iconify-icon>
                  <span class="cause-text">Network connection was interrupted</span>
                </div>
                <div class="cause-item">
                  <iconify-icon icon="ph:shield-warning" width="16" class="cause-icon"></iconify-icon>
                  <span class="cause-text">Browser security settings blocked the request</span>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="buttons">
              <a href="/" class="button">
                <iconify-icon icon="ph:arrow-clockwise-bold" width="18"></iconify-icon>
                Try Again
              </a>
              <a href="https://support.google.com/accounts/" target="_blank" rel="noopener noreferrer" class="button button-secondary">
                <iconify-icon icon="ph:question" width="18"></iconify-icon>
                Get Help
              </a>
            </div>
            
            <!-- Technical Details -->
            <div class="technical-details">
              <div class="technical-label">Technical Details</div>
              ${errorMessage}
            </div>
          </div>
        </div>
      </body>
      </html>
      `,
        500
      );
    }
  };
}
