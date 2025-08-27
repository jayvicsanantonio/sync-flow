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
    const url = 'https://oauth2.googleapis.com/token';
    const params = {
      code,
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${SERVER_BASE_URL}/api/auth/google/callback`,
      grant_type: 'authorization_code',
    };

    console.log('🔵 Google Auth API Request:', {
      url,
      method: 'POST',
      params: {
        ...params,
        client_secret: '[REDACTED]',
        code: `${code.substring(0, 10)}...`,
      },
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔴 Google Auth API Error Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new GoogleAPIError(
        'Failed to exchange code for tokens',
        errorData,
        response.status
      );
    }

    const tokens = await response.json();
    console.log('🟢 Google Auth API Response:', {
      url,
      status: response.status,
      data: {
        has_access_token: !!tokens.access_token,
        has_refresh_token: !!tokens.refresh_token,
        expires_in: tokens.expires_in,
        token_type: tokens.token_type,
      },
    });

    return tokens;
  }

  async getUserProfile(accessToken: string): Promise<GoogleUserInfo> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo';

    console.log('🔵 Google UserInfo API Request:', {
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken.substring(0, 20)}...`,
      },
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('🔴 Google UserInfo API Error Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });

      if (response.status === 401) {
        throw new AuthenticationError('Invalid or expired access token');
      }

      throw new GoogleAPIError(
        'Failed to fetch user profile',
        errorData,
        response.status
      );
    }

    const userInfo = await response.json();
    console.log('🟢 Google UserInfo API Response:', {
      url,
      status: response.status,
      data: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
      },
    });

    return userInfo;
  }

  async refreshTokens(refreshToken: string): Promise<UserTokens> {
    if (!refreshToken) {
      throw new AuthenticationError('No refresh token provided');
    }

    const params = {
      client_id: GOOGLE_CLIENT_ID!,
      client_secret: GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

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
