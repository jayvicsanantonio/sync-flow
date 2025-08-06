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
        <meta name="description" content="SyncFlow - Never lose a task again. Bridge Apple Reminders and Google Tasks with real-time, intelligent synchronization.">
        <meta property="og:title" content="SyncFlow - Your Tasks, Unified Across Platforms">
        <meta property="og:description" content="Stop managing tasks in two places. SyncFlow seamlessly bridges Apple Reminders and Google Tasks with enterprise-grade security.">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <title>SyncFlow - Sign In to Start Syncing</title>
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
          
          /* Background gradient orbs */
          .background-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.2;
          }
          
          .orb-1 {
            width: 400px;
            height: 400px;
            background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
            top: -200px;
            right: -100px;
          }
          
          .orb-2 {
            width: 300px;
            height: 300px;
            background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
            bottom: -150px;
            left: -100px;
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
          }
          
          .logo {
            width: 60px;
            height: 60px;
            margin: 0 auto var(--gap);
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-gradient);
            border-radius: var(--radius-md);
            color: white;
            box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
            animation: logo-pulse 2s ease-in-out infinite;
          }
          
          @keyframes logo-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          h1 {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: -0.03em;
            margin: 0 0 var(--gap-half) 0;
            text-align: center;
            color: var(--foreground);
          }
          
          .brand-name {
            background: var(--primary-gradient);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .description {
            font-size: 16px;
            color: var(--muted-foreground);
            text-align: center;
            margin: 0 0 var(--gap-double) 0;
            line-height: 1.6;
          }
          
          .features {
            display: flex;
            flex-direction: column;
            gap: var(--gap);
            margin-bottom: var(--gap-double);
            padding: var(--gap) 0;
            border-top: 1px solid var(--border);
            border-bottom: 1px solid var(--border);
          }
          
          .feature {
            display: flex;
            align-items: center;
            gap: var(--gap);
          }
          
          .feature-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
            border-radius: var(--radius);
            flex-shrink: 0;
            color: var(--primary);
          }
          
          .feature-text {
            font-size: 14px;
            color: var(--muted-foreground);
            line-height: 1.5;
          }
          
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-half);
            width: 100%;
            padding: 14px 28px;
            background: var(--primary-gradient);
            color: white;
            text-decoration: none;
            border-radius: var(--radius-md);
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
              0 4px 14px 0 rgba(139, 92, 246, 0.35),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            cursor: pointer;
            border: none;
            outline: none;
            margin-bottom: var(--gap);
          }
          
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 8px 20px 0 rgba(139, 92, 246, 0.45),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          }
          
          .button:focus-visible {
            box-shadow: 
              0 0 0 2px var(--background),
              0 0 0 4px var(--primary);
          }
          
          .google-icon {
            width: 18px;
            height: 18px;
          }
          
          .footer-text {
            font-size: 13px;
            color: var(--muted-foreground);
            text-align: center;
            line-height: 1.6;
          }
          
          .footer-text strong {
            color: var(--foreground);
            font-weight: 500;
          }
          
          .loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid white;
            border-radius: 50%;
            border-top-color: transparent;
            animation: spin 0.6s linear infinite;
          }
          
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 600px) {
            .container {
              padding: var(--gap);
            }
            
            .card {
              padding: var(--gap-double);
            }
            
            h1 {
              font-size: 24px;
            }
            
            .description {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <!-- Background gradient orbs -->
        <div class="background-orb orb-1"></div>
        <div class="background-orb orb-2"></div>
        
        <div class="container">
          <div class="card">
            <div class="logo">
              <iconify-icon icon="ph:arrows-clockwise-bold" width="28"></iconify-icon>
            </div>
            <h1><span class="brand-name">SyncFlow</span></h1>
            <p class="description">Bridge Apple Reminders and Google Tasks with real-time synchronization</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">
                  <iconify-icon icon="ph:arrows-left-right-bold" width="20"></iconify-icon>
                </div>
                <div class="feature-text">Bidirectional task synchronization</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <iconify-icon icon="ph:shield-check-fill" width="20"></iconify-icon>
                </div>
                <div class="feature-text">OAuth 2.0 secure authentication</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <iconify-icon icon="ph:lightning-fill" width="20"></iconify-icon>
                </div>
                <div class="feature-text">Real-time webhook updates</div>
              </div>
              <div class="feature">
                <div class="feature-icon">
                  <iconify-icon icon="ph:timer-fill" width="20"></iconify-icon>
                </div>
                <div class="feature-text">2-minute setup process</div>
              </div>
            </div>
            
            <a href="${authUrl}" class="button" 
               aria-label="Sign in with Google"
               onclick="this.innerHTML='<span class=\'loading\'></span>&nbsp;&nbsp;Redirecting...'; this.style.pointerEvents='none';">
              <iconify-icon icon="logos:google-icon" width="18" class="google-icon"></iconify-icon>
              Sign in with Google
            </a>
            
            <div class="footer-text">
              <strong>Secure & Private:</strong> SyncFlow uses OAuth 2.0 authentication.
              <br>Your password stays with Google. We only access task data to enable sync.
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
  };
}
