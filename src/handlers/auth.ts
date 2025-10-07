import type { Context } from 'hono';
import type { GoogleAuthService } from '../services/google-auth';
import type { UserService } from '../services/user';
import type { User } from '../types/user';

export function createAuthHandler(
  googleAuthService: GoogleAuthService,
  userService: UserService
) {
  return async function handleGoogleCallback(c: Context) {
    const code = c.req.query('code');
    if (!code) {
      throw new Error('Missing authorization code');
    }

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
        <meta name="description" content="SyncFlow - Successfully connected! Your tasks are now syncing between Apple Reminders and Google Tasks.">
        <title>SyncFlow - Connected Successfully</title>
        <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          :root {
            /* Geist-inspired color system */
            --background: #0a0a0a;
            --foreground: #f5f5f5;
            --card: #111111;
            --card-foreground: #f5f5f5;
            --muted: #141414;
            --muted-foreground: #9ba1a6;
            --border: #1f1f1f;
            
            /* Primary Accent */
            --primary: #0070f3;
            --primary-light: #2b8dff;
            --primary-dark: #0053b5;
            --primary-gradient: var(--primary);
            --primary-gradient-hover: var(--primary-dark);
            --primary-surface: rgba(0, 112, 243, 0.16);
            --primary-surface-strong: rgba(0, 112, 243, 0.26);
            --focus-ring: rgba(0, 112, 243, 0.35);

            /* Secondary Accent */
            --accent: #0b8cff;
            --accent-light: #34a1ff;
            --accent-dark: #004f9e;
            
            /* Status Colors */
            --success: #17c964;
            --warning: #f5a623;
            --error: #f21361;
            --info: #3291ff;
            
            /* Gray Scale */
            --gray-50: #111111;
            --gray-100: #161616;
            --gray-200: #1c1c1c;
            --gray-300: #212121;
            --gray-400: #2a2a2a;
            --gray-500: #343434;
            --gray-600: #444444;
            --gray-700: #595959;
            --gray-800: #777777;
            --gray-900: #e5e5e5;
            
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
            --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.35);
            --shadow: 0 6px 16px -6px rgb(0 0 0 / 0.65);
            --shadow-md: 0 12px 28px -12px rgb(0 0 0 / 0.7);
            --shadow-lg: 0 18px 40px -16px rgb(0 0 0 / 0.75);
            --shadow-xl: 0 24px 60px -20px rgb(0 0 0 / 0.8);
            --shadow-2xl: 0 32px 80px -24px rgb(0 0 0 / 0.85);
            --shadow-inner: inset 0 1px 0 0 rgb(255 255 255 / 0.05);
            
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
            position: relative;
            overflow-x: hidden;
            padding: var(--gap-double) 0;
          }
          
          /* Background orbs - matching landing.ts */
          .hero-gradient-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(100px);
            opacity: 0.3;
          }

          .orb-1 {
            width: 600px;
            height: 600px;
            background: var(--primary-surface-strong);
            top: -200px;
            right: -100px;
            animation: orb-float-1 20s ease-in-out infinite;
          }

          .orb-2 {
            width: 400px;
            height: 400px;
            background: var(--primary-surface);
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
            max-width: 800px;
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
            animation: fadeInUp 0.4s ease-out;
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
          
          /* Success Badge */
          .success-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 6px 4px 16px;
            background: rgba(23, 201, 100, 0.18);
            border: 1px solid rgba(23, 201, 100, 0.32);
            border-radius: 50px;
            margin-bottom: 24px;
            font-size: 14px;
            font-weight: 500;
          }
          
          .success-badge-icon {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 2px 10px;
            background: var(--primary);
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
          
          .success-gradient {
            background: var(--primary-light);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            display: inline-block;
          }
          
          .welcome-text {
            font-size: 16px;
            color: var(--muted-foreground);
            margin: 0 0 var(--gap-double) 0;
            line-height: 1.6;
          }
          
          .user-name {
            font-weight: 600;
            color: var(--foreground);
          }
          
          /* User Profile Card */
          .user-profile {
            display: flex;
            align-items: center;
            gap: var(--gap);
            padding: var(--gap-double);
            background: var(--gray-50);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            margin-bottom: var(--gap-double);
            text-align: left;
          }
          
          .user-avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            border: 3px solid var(--primary-light);
            box-shadow: 0 0 0 6px rgba(0, 112, 243, 0.18);
            flex-shrink: 0;
          }
          
          .user-info {
            flex: 1;
            min-width: 0;
          }
          
          .user-email {
            font-size: 14px;
            color: var(--foreground);
            font-weight: 600;
            margin-bottom: var(--gap-quarter);
            word-break: break-all;
          }
          
          .user-id {
            font-size: 12px;
            font-family: var(--font-mono);
            color: var(--muted-foreground);
            word-break: break-all;
          }
          
          /* Next Steps */
          .next-steps {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: var(--gap-double);
            margin-bottom: var(--gap-double);
            text-align: left;
          }
          
          .next-steps-title {
            font-size: 16px;
            font-weight: 700;
            color: var(--foreground);
            margin-bottom: var(--gap);
            display: flex;
            align-items: center;
            gap: var(--gap-half);
          }
          
          .step-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap);
          }
          
          .step-item {
            display: flex;
            align-items: flex-start;
            gap: var(--gap);
            padding: var(--gap);
            background: var(--gray-50);
            border-radius: var(--radius);
            border: 1px solid transparent;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          
          .step-item:hover {
            border-color: var(--primary-light);
            transform: translateX(4px);
            background: var(--card);
          }
          
          .step-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            border-radius: 50%;
            color: white;
            flex-shrink: 0;
          }
          
          .step-content {
            flex: 1;
          }
          
          .step-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--foreground);
            margin-bottom: 2px;
          }
          
          .step-description {
            font-size: 13px;
            color: var(--muted-foreground);
            line-height: 1.5;
          }
          
          /* Action Button */
          .action-section {
            display: flex;
            flex-direction: column;
            gap: var(--gap);
            align-items: center;
          }
          
          .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--gap-half);
            padding: 14px 32px;
            background: var(--primary);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 
              0 22px 46px -22px rgba(0, 112, 243, 0.82),
              inset 0 0 0 1px rgba(255, 255, 255, 0.1);
            cursor: pointer;
            border: none;
          }
          
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 
              0 28px 56px -24px rgba(0, 112, 243, 0.92),
              inset 0 0 0 1px rgba(255, 255, 255, 0.2);
          }
          
          .helper-text {
            font-size: 13px;
            color: var(--muted-foreground);
            text-align: center;
          }
          
          /* Shortcuts Setup Section */
          .setup-section {
            margin-bottom: var(--gap-double);
            text-align: left;
            padding: var(--gap-double);
            background: var(--gray-50);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
          }
          
          .setup-section-title {
            font-size: 18px;
            font-weight: 700;
            color: var(--foreground);
            margin-bottom: var(--gap);
            display: flex;
            align-items: center;
            gap: var(--gap-half);
          }
          
          .shortcut-list {
            display: flex;
            flex-direction: column;
            gap: var(--gap);
          }
          
          .shortcut-card {
            padding: var(--gap);
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            transition: all 0.2s ease;
          }
          
          .shortcut-card:hover {
            border-color: var(--primary-light);
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
          }
          
          .shortcut-header {
            display: flex;
            align-items: center;
            gap: var(--gap-half);
            margin-bottom: var(--gap-half);
          }
          
          .shortcut-icon {
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            border-radius: var(--radius-sm);
            color: white;
            flex-shrink: 0;
          }
          
          .shortcut-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--foreground);
          }
          
          .shortcut-description {
            font-size: 14px;
            color: var(--muted-foreground);
            margin-bottom: var(--gap-half);
          }
          
          .steps-list {
            padding-left: var(--gap-double);
            margin-bottom: var(--gap-half);
            font-size: 14px;
            color: var(--foreground);
          }
          
          .steps-list li {
            margin-bottom: var(--gap-quarter);
          }
          
          .code-block {
            background: var(--foreground);
            color: var(--gray-50);
            border-radius: var(--radius-sm);
            padding: var(--gap-half);
            font-family: var(--font-mono);
            font-size: 12px;
            overflow-x: auto;
            margin-bottom: var(--gap-half);
            white-space: pre;
          }
          
          .tip-text {
            font-size: 13px;
            color: var(--primary);
            font-style: italic;
            display: flex;
            align-items: center;
            gap: var(--gap-quarter);
          }
          @media (max-width: 600px) {
            .container {
              padding: var(--gap);
            }
            
            .card {
              padding: var(--gap-double);
            }
            
            h1 {
              font-size: 28px;
            }
            
            .user-profile {
              flex-direction: column;
              text-align: center;
            }
            
            .user-info {
              width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <!-- Background orbs - matching landing.ts -->
        <div class="hero-gradient-orb orb-1"></div>
        <div class="hero-gradient-orb orb-2"></div>
        
        <div class="container">
          <div class="card">
            <!-- Success Badge -->
            <div class="success-badge">
              <span>Connection Successful</span>
              <span class="success-badge-icon">
                <iconify-icon icon="ph:check-bold" width="12"></iconify-icon>
                ACTIVE
              </span>
            </div>
            
            <h1>
              <span class="success-gradient">Welcome aboard!</span>
            </h1>
            
            <p class="welcome-text">
              Hey <span class="user-name">${userProfile.name}</span>! Your Google account is now connected to SyncFlow.
              Your tasks will start syncing automatically.
            </p>
            
            <!-- User Profile Card -->
            ${
              userProfile.picture
                ? `
            <div class="user-profile">
              <img src="${userProfile.picture}" alt="${userProfile.name}" class="user-avatar">
              <div class="user-info">
                <div class="user-email">${userProfile.email}</div>
                <div class="user-id">ID: ${id}</div>
              </div>
            </div>
            `
                : `
            <div class="user-profile">
            <div class="user-avatar" style="background: var(--primary); display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 700;">
                ${userProfile.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div class="user-info">
                <div class="user-email">${userProfile.email}</div>
                <div class="user-id">ID: ${id}</div>
              </div>
            </div>
            `
            }
            
            <!-- Next Steps -->
            <div class="next-steps">
              <h3 class="next-steps-title">
                <iconify-icon icon="ph:rocket-launch-bold" width="20" style="color: var(--primary);"></iconify-icon>
                What happens next?
              </h3>
              <div class="step-list">
                <div class="step-item">
                  <div class="step-icon">
                    <iconify-icon icon="ph:arrows-clockwise-bold" width="16"></iconify-icon>
                  </div>
                  <div class="step-content">
                    <div class="step-title">Automatic Synchronization</div>
                    <div class="step-description">Your tasks will sync between Apple Reminders and Google Tasks in real-time</div>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-icon">
                    <iconify-icon icon="ph:cloud-check-bold" width="16"></iconify-icon>
                  </div>
                  <div class="step-content">
                    <div class="step-title">Bidirectional Updates</div>
                    <div class="step-description">Changes made in either app will be reflected in the other within seconds</div>
                  </div>
                </div>
                <div class="step-item">
                  <div class="step-icon">
                    <iconify-icon icon="ph:shield-check-bold" width="16"></iconify-icon>
                  </div>
                  <div class="step-content">
                    <div class="step-title">Secure & Private</div>
                    <div class="step-description">Your data is encrypted and never stored - we only facilitate the sync</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Apple Shortcuts Setup -->
            <div class="setup-section">
              <h3 class="setup-section-title">
                <iconify-icon icon="simple-icons:apple" width="20" style="color: var(--foreground);"></iconify-icon>
                Apple Shortcuts Setup Guide
              </h3>
              <div class="shortcut-list">
                <!-- Add New Habit Shortcut -->
                <div class="shortcut-card">
                  <div class="shortcut-header">
                    <div class="shortcut-icon">
                      <iconify-icon icon="ph:plus-bold" width="16"></iconify-icon>
                    </div>
                    <div class="shortcut-title">Add New Habit</div>
                  </div>
                  <div class="shortcut-description">
                    Create a new habit in Apple Reminders that automatically syncs to Google Tasks
                  </div>
                  <ol class="steps-list">
                    <li>Open the Shortcuts app on your iPhone/iPad</li>
                    <li>Tap the "+" button to create a new shortcut</li>
                    <li>Add "Get Text from Input" action</li>
                    <li>Add "Get Contents of URL" action with the following settings:</li>
                  </ol>
                  <div class="code-block">URL: https://your-domain.vercel.app/api/webhook/task/create
Method: POST
Headers: Content-Type → application/json
Request Body: {"title": "[Text from Input]", "user_id": "${id}"}</div>
                  <ol class="steps-list" style="counter-reset: list 4;">
                    <li style="counter-increment: list;">Add "Add to Reminders" action to create the task locally</li>
                    <li style="counter-increment: list;">Test the shortcut with a sample task</li>
                  </ol>
                  <div class="tip-text">
                    <iconify-icon icon="ph:lightbulb-bold" width="14"></iconify-icon>
                    Tip: You can add this shortcut to your home screen for quick access
                  </div>
                </div>

                <!-- Edit Habit Shortcut -->
                <div class="shortcut-card">
                  <div class="shortcut-header">
                    <div class="shortcut-icon">
                      <iconify-icon icon="ph:pencil-bold" width="16"></iconify-icon>
                    </div>
                    <div class="shortcut-title">Edit Habit</div>
                  </div>
                  <div class="shortcut-description">
                    Update an existing habit and sync the changes to Google Tasks
                  </div>
                  <ol class="steps-list">
                    <li>Open the Shortcuts app</li>
                    <li>Create a new shortcut for editing</li>
                    <li>Add "Choose from Menu" action with options: "Change Title", "Mark Complete", "Change Priority"</li>
                    <li>For each menu option, add "Get Contents of URL" with:</li>
                  </ol>
                  <div class="code-block">URL: https://your-domain.vercel.app/api/webhook/task/update
Method: PUT
Headers: Content-Type → application/json
Request Body: {"task_id": "[Task ID]", "title": "[New Title]", "completed": true/false, "user_id": "${id}"}</div>
                  <ol class="steps-list" style="counter-reset: list 4;">
                    <li style="counter-increment: list;">Add corresponding Reminders actions to update locally</li>
                    <li style="counter-increment: list;">Test with different edit scenarios</li>
                  </ol>
                  <div class="tip-text">
                    <iconify-icon icon="ph:lightbulb-bold" width="14"></iconify-icon>
                    Pro tip: Use "Ask for Input" to make the shortcut interactive
                  </div>
                </div>

                <!-- Delete Habit Shortcut -->
                <div class="shortcut-card">
                  <div class="shortcut-header">
                    <div class="shortcut-icon">
                      <iconify-icon icon="ph:trash-bold" width="16"></iconify-icon>
                    </div>
                    <div class="shortcut-title">Delete Habit</div>
                  </div>
                  <div class="shortcut-description">
                    Remove a habit from both Apple Reminders and Google Tasks
                  </div>
                  <ol class="steps-list">
                    <li>Create a new shortcut in the Shortcuts app</li>
                    <li>Add "Choose from List" to select which habit to delete</li>
                    <li>Add "Ask for Confirmation" action for safety</li>
                    <li>Add "Get Contents of URL" action:</li>
                  </ol>
                  <div class="code-block">URL: https://your-domain.vercel.app/api/webhook/task/delete
Method: DELETE
Headers: Content-Type → application/json
Request Body: {"task_id": "[Task ID]", "user_id": "${id}"}</div>
                  <ol class="steps-list" style="counter-reset: list 4;">
                    <li style="counter-increment: list;">Add "Delete Reminders" action to remove locally</li>
                    <li style="counter-increment: list;">Test deletion carefully with a test task</li>
                  </ol>
                  <div class="tip-text">
                    <iconify-icon icon="ph:warning-bold" width="14"></iconify-icon>
                    Important: Always include confirmation step to prevent accidental deletions
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Section -->
            <div class="action-section">
              <a href="/" class="button">
                <iconify-icon icon="ph:house-bold" width="18"></iconify-icon>
                Go to Dashboard
              </a>
              <p class="helper-text">
                Need help? Check out our 
                <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 500;">setup guide</a>
                or 
                <a href="#" style="color: var(--primary); text-decoration: none; font-weight: 500;">documentation</a>
              </p>
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
              /* Geist-inspired Color Palette */
              --background: #0a0a0a;
              --foreground: #f5f5f5;
              --card: #111111;
              --card-foreground: #f5f5f5;
              --muted: #141414;
              --muted-foreground: #9ba1a6;
              --border: #1f1f1f;
              
              /* Primary Accent */
              --primary: #0070f3;
              --primary-light: #2b8dff;
              --primary-dark: #0053b5;
              --primary-gradient: var(--primary);
              --primary-gradient-hover: var(--primary-dark);
              --primary-surface: rgba(0, 112, 243, 0.16);
              --primary-surface-strong: rgba(0, 112, 243, 0.26);
              --focus-ring: rgba(0, 112, 243, 0.35);
              
              /* Status Colors */
              --error: #f21361;
              --error-light: rgba(242, 19, 97, 0.15);
              --error-border: rgba(242, 19, 97, 0.35);
              --warning: #f5a623;
              --success: #17c964;
              
              /* Spacing */
              --gap-quarter: 4px;
              --gap-half: 8px;
              --gap: 16px;
              --gap-double: 32px;
              --gap-triple: 48px;
              --page-margin: 24px;
              
              /* Typography */
              --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              --line-height: 1.5;
              --line-height-large: 1.8;
              
              /* Shadows */
              --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.35);
              --shadow: 0 6px 16px -6px rgb(0 0 0 / 0.65);
              --shadow-md: 0 12px 28px -12px rgb(0 0 0 / 0.7);
              --shadow-lg: 0 18px 40px -16px rgb(0 0 0 / 0.75);
              --shadow-xl: 0 24px 60px -20px rgb(0 0 0 / 0.8);
              
              /* Borders */
              --radius-sm: 6px;
              --radius: 8px;
              --radius-md: 12px;
              --radius-lg: 16px;
              --radius-xl: 24px;
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
            
            /* Background orbs */
            .background-orb {
              position: absolute;
              border-radius: 50%;
              filter: blur(110px);
              opacity: 0.55;
            }
            
            .orb-1 {
              width: 400px;
              height: 400px;
              background: var(--primary-surface-strong);
              top: -200px;
              right: -100px;
            }
            
            .orb-2 {
              width: 300px;
              height: 300px;
              background: var(--primary-surface);
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
            
            .error-icon {
              width: 60px;
              height: 60px;
              margin: 0 auto var(--gap);
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--error-light);
              border: 1px solid var(--error-border);
              border-radius: var(--radius-md);
              color: var(--error);
            }
            
            h2 {
              font-size: 28px;
              font-weight: 800;
              letter-spacing: -0.03em;
              margin: 0 0 var(--gap-half) 0;
              color: var(--foreground);
            }
            
            .error-box {
              background: var(--error-light);
              border: 1px solid var(--error-border);
              border-radius: var(--radius-md);
              padding: var(--gap);
              margin: var(--gap-double) 0;
            }
            
            .error-message {
              color: var(--error);
              font-weight: 600;
              font-size: 14px;
              margin: 0;
            }
            
            .help-text {
              color: var(--muted-foreground);
              margin: var(--gap-double) 0;
              font-size: 14px;
              line-height: 1.6;
              text-align: left;
            }
            
            .help-list {
              list-style: none;
              padding: 0;
              margin: var(--gap) 0;
            }
            
            .help-list li {
              display: flex;
              align-items: flex-start;
              gap: var(--gap-half);
              margin-bottom: var(--gap-half);
            }
            
            .help-list-icon {
              color: var(--primary-light);
              flex-shrink: 0;
              margin-top: 2px;
            }
            
            .buttons {
              display: flex;
              gap: var(--gap);
              margin-top: var(--gap-double);
            }
            
            .button {
              flex: 1;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: var(--gap-half);
              padding: 14px 28px;
              background: var(--primary);
              color: white;
              text-decoration: none;
              border-radius: var(--radius-md);
              font-size: 16px;
              font-weight: 600;
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 
                0 22px 46px -22px rgba(0, 112, 243, 0.82),
                inset 0 0 0 1px rgba(255, 255, 255, 0.1);
              cursor: pointer;
              border: none;
            }
            
            .button:hover {
              transform: translateY(-2px);
              box-shadow: 
                0 28px 56px -24px rgba(0, 112, 243, 0.92),
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
            
            .error-details {
              margin-top: var(--gap-double);
              padding-top: var(--gap-double);
              border-top: 1px solid var(--border);
              font-size: 12px;
              color: var(--muted-foreground);
              font-family: monospace;
              word-break: break-all;
            }
            
            .error-details-label {
              font-family: var(--font-sans);
              font-weight: 500;
              margin-bottom: var(--gap-half);
              display: block;
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
          <!-- Background orbs -->
          <div class="background-orb orb-1"></div>
          <div class="background-orb orb-2"></div>
          
          <div class="container">
            <div class="card">
              <div class="error-icon">
                <iconify-icon icon="ph:x-circle-fill" width="32"></iconify-icon>
              </div>
              
              <h2>Authentication Failed</h2>
              
              <div class="error-box">
                <p class="error-message">
                  <iconify-icon icon="ph:warning" width="16" style="vertical-align: -2px; margin-right: 6px;"></iconify-icon>
                  We couldn't complete the authentication process
                </p>
              </div>
              
              <div class="help-text">
                <p style="margin: 0 0 var(--gap-half) 0; font-weight: 500; color: var(--foreground);">This might happen if:</p>
                <ul class="help-list">
                  <li>
                    <iconify-icon icon="ph:dot-fill" width="16" class="help-list-icon"></iconify-icon>
                    <span>The authorization was cancelled</span>
                  </li>
                  <li>
                    <iconify-icon icon="ph:dot-fill" width="16" class="help-list-icon"></iconify-icon>
                    <span>The authorization code expired</span>
                  </li>
                  <li>
                    <iconify-icon icon="ph:dot-fill" width="16" class="help-list-icon"></iconify-icon>
                    <span>There was a network error</span>
                  </li>
                </ul>
              </div>
              
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
              
              <div class="error-details">
                <span class="error-details-label">Error details:</span>
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
