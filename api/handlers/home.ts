import type { Context } from 'hono';
import type { GoogleAuthService } from '../services/google-auth';

export function createHomeHandler(googleAuthService: GoogleAuthService) {
  return async function handleHome(c: Context) {
    const authUrl = googleAuthService.generateAuthUrl();

    return c.html(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="Sync Flow - Never lose a task again. Seamlessly sync Apple Reminders with Google Tasks in real-time.">
        <meta property="og:title" content="Sync Flow - Unified Task Management Across Platforms">
        <meta property="og:description" content="Bridge the gap between Apple and Google ecosystems. Real-time, bidirectional task synchronization that just works.">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <title>Sync Flow - Bridge Your Apple & Google Tasks Seamlessly</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          
          /* Enhanced Design System */
          :root {
            /* Base Colors */
            --bg-primary: #000000;
            --bg-secondary: #0a0a0a;
            --bg-tertiary: #111111;
            --bg-card: #0f0f0f;
            --text-primary: #ffffff;
            --text-secondary: #a3a3a3;
            --text-tertiary: #666666;
            --border-primary: #262626;
            --border-secondary: #404040;
            
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
            --geist-page-width: 1048px;
            --geist-page-width-with-margin: 1096px;
            
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
          
          .logo {
            width: 48px;
            height: 48px;
            margin: 0 auto var(--geist-gap);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            background: var(--geist-accent-light);
            border-radius: 12px;
          }
          
          h1 {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0 0 var(--geist-gap-half) 0;
            text-align: center;
          }
          
          .description {
            font-size: 14px;
            color: var(--geist-foreground-secondary);
            text-align: center;
            margin: 0 0 var(--geist-gap-double) 0;
            line-height: 1.6;
          }
          
          .features {
            display: flex;
            flex-direction: column;
            gap: var(--geist-gap);
            margin-bottom: var(--geist-gap-double);
          }
          
          .feature {
            display: flex;
            align-items: flex-start;
            gap: var(--geist-gap);
          }
          
          .feature-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--geist-success-light);
            border-radius: 6px;
            flex-shrink: 0;
          }
          
          .feature-icon svg {
            width: 16px;
            height: 16px;
            stroke: var(--geist-success);
            stroke-width: 2;
          }
          
          .feature-text {
            font-size: 14px;
            color: var(--geist-foreground-secondary);
            line-height: 1.5;
            margin-top: 4px;
          }
          
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--geist-gap-half);
            width: 100%;
            height: 40px;
            padding: 0 var(--geist-gap);
            font-family: var(--font-sans);
            font-size: 14px;
            font-weight: 500;
            background: var(--geist-accent);
            color: var(--geist-foreground);
            border: none;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
            user-select: none;
            -webkit-user-select: none;
            outline: none;
            margin-bottom: var(--geist-gap);
          }
          
          .button:hover {
            background: var(--geist-accent-hover);
          }
          
          .button:focus-visible {
            box-shadow: 0 0 0 2px var(--geist-background), 0 0 0 4px var(--geist-accent);
          }
          
          .button svg {
            width: 16px;
            height: 16px;
          }
          
          .footer-text {
            font-size: 12px;
            color: var(--geist-foreground-tertiary);
            text-align: center;
            line-height: 1.5;
          }
          
          .footer-text a {
            color: var(--geist-foreground-secondary);
            text-decoration: none;
            transition: color 0.15s ease;
          }
          
          .footer-text a:hover {
            color: var(--geist-foreground);
          }
          
          .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid var(--geist-foreground);
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.6s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
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
            <div class="logo">
              🔄
            </div>
            <h1>Sync Flow</h1>
            <p class="description">Seamlessly sync your Apple Reminders with Google Tasks</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M4 12L20 12M4 12L10 6M4 12L10 18M20 12L14 6M20 12L14 18" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">Automatic two-way synchronization</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L12 6M12 18L12 22M6 12L2 12M22 12L18 12M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">Secure OAuth 2.0 authentication</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">Real-time updates via webhooks</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M10 13C10.4295 13.5741 10.9774 14.0491 11.6066 14.3929C12.2357 14.7367 12.9315 14.9411 13.6467 14.9923C14.3618 15.0435 15.0796 14.9404 15.7513 14.6898C16.4231 14.4392 17.0331 14.047 17.54 13.54L20.54 10.54C21.4508 9.59695 21.9548 8.33394 21.9434 7.02296C21.932 5.71198 21.4061 4.45791 20.4791 3.53087C19.5521 2.60383 18.298 2.07799 16.987 2.0666C15.676 2.0552 14.413 2.55918 13.47 3.46997L11.75 5.17997" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11C13.5705 10.4259 13.0226 9.95083 12.3934 9.60707C11.7642 9.26331 11.0684 9.05889 10.3533 9.00768C9.63816 8.95646 8.92037 9.05964 8.24861 9.31023C7.57685 9.56082 6.96684 9.95296 6.45996 10.46L3.45996 13.46C2.54917 14.403 2.04519 15.666 2.05659 16.977C2.06798 18.288 2.59382 19.5421 3.52086 20.4691C4.4479 21.3961 5.70197 21.922 7.01295 21.9334C8.32393 21.9448 9.58694 21.4408 10.53 20.53L12.24 18.82" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="feature-text">URL links synchronization support</div>
              </div>
            </div>
            
            <a href="${authUrl}" class="button" 
               aria-label="Sign in with Google"
               onclick="this.innerHTML='<span class=\\'loading\\'></span>&nbsp;&nbsp;Redirecting...'; this.style.pointerEvents='none';">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Sign in with Google
            </a>
            
            <div class="footer-text">
              By signing in, you'll be redirected to Google's secure authorization page.
              <br>We only access your Google Tasks data to enable synchronization.
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  };
}
