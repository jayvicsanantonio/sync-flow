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

      return c.html(
        `<h2>✅ Auth Successful!</h2>
         <p>Welcome, <strong>${userProfile.name}</strong>!</p>
         <p>Your email: <code>${userProfile.email}</code></p>
         <p>Your ID is: <code>${id}</code></p>`
      );
    } catch (error) {
      console.error('Authentication error:', error);
      return c.text('Authentication failed.', 500);
    }
  };
}
