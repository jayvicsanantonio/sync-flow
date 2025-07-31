import { Redis } from '@upstash/redis';
import type { User } from '../types/user';
import { GoogleAuthService } from './google-auth';

export class UserService {
  private redis: Redis;
  private googleAuthService: GoogleAuthService;

  constructor(redis: Redis, googleAuthService: GoogleAuthService) {
    this.redis = redis;
    this.googleAuthService = googleAuthService;
  }

  async getUserById(userId: string): Promise<User | null> {
    const userJSON = await this.redis.get(`user:${userId}`);
    if (!userJSON) {
      return null;
    }

    if (typeof userJSON === 'string') {
      return JSON.parse(userJSON) as User;
    }
    return userJSON as User;
  }

  async saveUser(user: User): Promise<void> {
    await this.redis.set(`user:${user.id}`, JSON.stringify(user));
  }

  async updateSyncedTaskIds(
    userId: string,
    newTaskIds: string[]
  ): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.syncedTaskIds.push(...newTaskIds);
    await this.saveUser(user);
  }

  async callGoogleAPIWithRefresh<T>(
    userId: string,
    apiCall: (accessToken: string) => Promise<T>
  ): Promise<T> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    try {
      return await apiCall(user.tokens.access_token);
    } catch (error: any) {
      console.log(
        'API call failed, checking if token refresh is needed...'
      );

      if (error.message && error.message.includes('401')) {
        console.log('Token expired, attempting refresh...');

        if (!user.tokens.refresh_token) {
          throw new Error(
            'No refresh token available. User needs to re-authenticate.'
          );
        }

        try {
          const newTokens =
            await this.googleAuthService.refreshTokens(
              user.tokens.refresh_token
            );

          user.tokens = {
            ...user.tokens,
            access_token: newTokens.access_token,
            refresh_token:
              newTokens.refresh_token || user.tokens.refresh_token,
          };

          await this.saveUser(user);

          console.log(
            'Token refreshed successfully, retrying API call...'
          );

          return await apiCall(user.tokens.access_token);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          throw new Error(
            'Token refresh failed. User needs to re-authenticate.'
          );
        }
      } else {
        throw error;
      }
    }
  }
}
