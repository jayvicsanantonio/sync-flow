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
          <title>Sync Flow - Authentication Failed</title>
          <style>
            * {
              box-sizing: border-box;
            }
            
            :root {
              --primary: #4285f4;
              --error: #ea4335;
              --text-primary: #202124;
              --text-secondary: #5f6368;
              --bg-secondary: #f8f9fa;
              --shadow: 0 1px 3px rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);
            }
            
            @media (prefers-color-scheme: dark) {
              :root {
                --text-primary: #e8eaed;
                --text-secondary: #9aa0a6;
                --bg-secondary: #292a2d;
              }
              body {
                background-color: #202124;
              }
              .container {
                background: #303134;
              }
              .error-box {
                background: rgba(234, 67, 53, 0.1);
                border-color: rgba(234, 67, 53, 0.3);
              }
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: var(--text-primary);
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            }
            
            .container {
              background: white;
              border-radius: 16px;
              box-shadow: var(--shadow);
              padding: 48px;
              max-width: 480px;
              width: 90%;
              text-align: center;
              animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            
            h2 {
              font-size: 2rem;
              font-weight: 600;
              margin: 0 0 24px 0;
              color: var(--text-primary);
            }
            
            .error-icon {
              display: inline-block;
              color: var(--error);
              font-size: 3rem;
              margin-bottom: 24px;
            }
            
            .error-box {
              background: rgba(234, 67, 53, 0.08);
              border: 1px solid rgba(234, 67, 53, 0.2);
              border-radius: 8px;
              padding: 20px;
              margin: 24px 0;
            }
            
            .error-message {
              color: var(--error);
              font-weight: 500;
              margin: 0;
            }
            
            .help-text {
              color: var(--text-secondary);
              margin: 24px 0;
              font-size: 1rem;
            }
            
            .button {
              display: inline-block;
              padding: 12px 24px;
              font-size: 16px;
              font-weight: 500;
              text-decoration: none;
              border-radius: 8px;
              background: var(--primary);
              color: white;
              margin: 16px 8px;
              transition: all 0.2s ease;
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .button:hover {
              background: #3367d6;
              transform: translateY(-1px);
              box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            .button-secondary {
              background: transparent;
              color: var(--primary);
              border: 1px solid var(--primary);
              box-shadow: none;
            }
            
            .button-secondary:hover {
              background: rgba(66, 133, 244, 0.08);
              transform: none;
              box-shadow: none;
            }
            
            .error-details {
              margin-top: 24px;
              font-size: 0.875rem;
              color: var(--text-secondary);
            }
            
            @media (max-width: 600px) {
              .container {
                padding: 32px 24px;
                width: 95%;
              }
              h2 { font-size: 1.75rem; }
              .button {
                display: block;
                width: 100%;
                margin: 8px 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="error-icon">❌</span>
            <h2>Authentication Failed</h2>
            
            <div class="error-box">
              <p class="error-message">We couldn't complete the authentication process</p>
            </div>
            
            <p class="help-text">
              This might happen if:
              <br>• The authorization was cancelled
              <br>• The authorization code expired
              <br>• There was a network error
            </p>
            
            <div>
              <a href="/" class="button">Try Again</a>
              <a href="https://support.google.com/accounts/" target="_blank" rel="noopener noreferrer" class="button button-secondary">Get Help</a>
            </div>
            
            <p class="error-details">
              Error details: ${errorMessage}
            </p>
          </div>
        </body>
        </html>
      `,
        500
      );
    }
  };
}
