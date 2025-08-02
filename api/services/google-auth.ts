import type { UserTokens } from '../types/auth';
import type { GoogleUserInfo } from '../types/google-api';
import { GoogleAPIError, AuthenticationError } from '../utils/errors';

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_BASE_URL } = process.env;

const GOOGLE_SCOPES = {
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  USERINFO_PROFILE: 'https://www.googleapis.com/auth/userinfo.profile',
  TASKS: 'https://www.googleapis.com/auth/tasks',
  TASKS_READONLY: 'https://www.googleapis.com/auth/tasks.readonly',
} as const;

export class GoogleAuthService {
  async exchangeCodeForTokens(code: string): Promise<UserTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${SERVER_BASE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new GoogleAPIError(
        'Failed to exchange code for tokens',
        errorData,
        response.status
      );
    }

    return await response.json();
  }

  async getUserProfile(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();

      if (response.status === 401) {
        throw new AuthenticationError('Invalid or expired access token');
      }

      throw new GoogleAPIError(
        'Failed to fetch user profile',
        errorData,
        response.status
      );
    }

    return await response.json();
  }

  async refreshTokens(refreshToken: string): Promise<UserTokens> {
    console.log('Refreshing Google tokens...');

    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided');
    }

    const params = {
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    console.log('Refresh token request params:', {
      client_id: GOOGLE_CLIENT_ID,
      has_client_secret: !!GOOGLE_CLIENT_SECRET,
      has_refresh_token: !!refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (response.status === 400) {
        // Parse error response for more details
        try {
          const errorJson = JSON.parse(errorData);
          console.error('Token refresh error details:', errorJson);
          throw new AuthenticationError(
            `Refresh token expired or invalid: ${errorJson.error_description || errorJson.error}`
          );
        } catch {
          throw new AuthenticationError('Refresh token expired or invalid');
        }
      }

      throw new GoogleAPIError(
        'Failed to refresh Google tokens',
        errorData,
        response.status
      );
    }

    const newTokens = await response.json();
    console.log('Successfully refreshed tokens:', {
      has_access_token: !!newTokens.access_token,
      has_refresh_token: !!newTokens.refresh_token,
      expires_in: newTokens.expires_in,
    });
    return newTokens;
  }

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID!,
      redirect_uri: `${SERVER_BASE_URL}/api/auth/google/callback`,
      response_type: 'code',
      scope: [
        GOOGLE_SCOPES.TASKS,
        GOOGLE_SCOPES.TASKS_READONLY,
        GOOGLE_SCOPES.USERINFO_EMAIL,
        GOOGLE_SCOPES.USERINFO_PROFILE,
      ].join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
