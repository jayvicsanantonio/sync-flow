import { config } from '../config/environment';
import type { UserTokens } from '../types/auth';
import type { GoogleUserInfo } from '../types/google-api';

export class GoogleAuthService {
  async exchangeCodeForTokens(code: string): Promise<UserTokens> {
    const response = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          redirect_uri: config.google.redirectUrl,
          grant_type: 'authorization_code',
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
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
      const errorText = await response.text();
      console.error('Google User Info API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(
        `Failed to fetch user profile: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return await response.json();
  }

  async refreshTokens(refreshToken: string): Promise<UserTokens> {
    console.log('Refreshing Google tokens...');

    const response = await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: config.google.clientId,
          client_secret: config.google.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to refresh tokens:', errorText);
      throw new Error('Failed to refresh Google tokens');
    }

    const newTokens = await response.json();
    console.log('Successfully refreshed tokens.');
    return newTokens;
  }

  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.google.clientId,
      redirect_uri: config.google.redirectUrl,
      response_type: 'code',
      scope: config.google.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }
}
