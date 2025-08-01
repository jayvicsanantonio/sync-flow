import type { Context } from 'hono';
import type { GoogleAuthService } from '../services/google-auth';

export function createHomeHandler(googleAuthService: GoogleAuthService) {
  return async function handleHome(c: Context) {
    const authUrl = googleAuthService.generateAuthUrl();

    return c.html(`
    <html>
      <head>
        <title>Sync Flow - Google Tasks Integration</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            text-align: center;
          }
          .auth-button {
            background: #4285f4;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-size: 16px;
            text-decoration: none;
            display: inline-block;
            margin: 20px 0;
          }
          .auth-button:hover {
            background: #3367d6;
          }
        </style>
      </head>
      <body>
        <h1>🔄 Sync Flow</h1>
        <p>Connect your Apple Reminders with Google Tasks</p>
        <p>Click the button below to authorize access to your Google Tasks:</p>
        <a href="${authUrl}" class="auth-button">Authorize Google Tasks</a>
        <p><small>This will redirect you to Google's authorization page.</small></p>
      </body>
    </html>
  `);
  };
}
