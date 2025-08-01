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
    const user = await this.redis.get(`user:${userId}`);

    if (!user) {
      return null;
    }

    if (typeof user === 'string' || user instanceof Buffer) {
      return JSON.parse(user.toString()) as User;
    }

    return user as User;
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

  async getAccessToken(userId: string): Promise<string> {
    const user = await this.getUserById(userId);

    if (
      !user ||
      !user.tokens.refresh_token ||
      !user.tokens.expires_in
    ) {
      throw new Error('User not found or missing tokens');
    }

    if (Date.now() >= user.tokens.expires_in - 60000) {
      console.log(`Refreshing token for user: ${userId}`);

      try {
        const newTokens = await this.googleAuthService.refreshTokens(
          user.tokens.refresh_token
        );

        await this.saveUser({
          ...user,
          tokens: newTokens,
        });
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw new Error(
          'Token refresh failed. User needs to re-authenticate.'
        );
      }
    }

    return user.tokens.access_token;
  }
}
