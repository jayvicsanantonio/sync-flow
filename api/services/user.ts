import type { Redis } from '@upstash/redis';
import type { User } from '../types/user';
import type { GoogleAuthService } from './google-auth';
import type { GoogleTasksService } from './google-tasks';

interface SyncSnapshot {
  taskIds: string[];
  taskDetails: Record<string, { syncId: string; updated: string }>;
  timestamp: string;
}

export class UserService {
  private redis: Redis;
  private googleAuthService: GoogleAuthService;
  public googleTasksService?: GoogleTasksService;

  constructor(
    redis: Redis,
    googleAuthService: GoogleAuthService,
    googleTasksService?: GoogleTasksService
  ) {
    this.redis = redis;
    this.googleAuthService = googleAuthService;
    this.googleTasksService = googleTasksService;
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

  async updateLastSyncTime(userId: string, syncTime: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.lastSyncTime = syncTime;
    await this.saveUser(user);
  }

  async saveTaskMapping(
    userId: string,
    syncId: string,
    googleTaskId: string
  ): Promise<void> {
    await this.redis.set(`taskmap:${userId}:sync:${syncId}`, googleTaskId);
    await this.redis.set(`taskmap:${userId}:google:${googleTaskId}`, syncId);

    const user = await this.getUserById(userId);
    if (user) {
      if (!user.taskMappings) {
        user.taskMappings = {};
      }
      user.taskMappings[syncId] = {
        googleTaskId,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      await this.saveUser(user);
    }
  }

  async getGoogleTaskIdBySyncId(
    userId: string,
    syncId: string
  ): Promise<string | null> {
    const taskId = await this.redis.get(`taskmap:${userId}:sync:${syncId}`);
    return taskId as string | null;
  }

  async getSyncIdByGoogleTaskId(
    userId: string,
    googleTaskId: string
  ): Promise<string | null> {
    const syncId = await this.redis.get(
      `taskmap:${userId}:google:${googleTaskId}`
    );
    return syncId as string | null;
  }

  async deleteTaskMapping(
    userId: string,
    syncId: string,
    googleTaskId: string
  ): Promise<void> {
    await this.redis.del(`taskmap:${userId}:sync:${syncId}`);
    await this.redis.del(`taskmap:${userId}:google:${googleTaskId}`);

    const user = await this.getUserById(userId);
    if (user && user.taskMappings) {
      delete user.taskMappings[syncId];
      await this.saveUser(user);
    }
  }

  async getAccessToken(userId: string): Promise<string> {
    let user = await this.getUserById(userId);

    if (!user || !user.tokens.refresh_token) {
      throw new Error('User not found or missing tokens');
    }

    const now = Date.now();
    const expiresAt = user.tokens.expires_at || 0;

    if (now >= expiresAt - 60000) {
      console.log(`Token expired or about to expire for user: ${userId}`);
      console.log(`Current time: ${new Date(now).toISOString()}`);
      console.log(`Token expires at: ${new Date(expiresAt).toISOString()}`);

      try {
        const newTokens = await this.googleAuthService.refreshTokens(
          user.tokens.refresh_token
        );

        if (newTokens.expires_in) {
          newTokens.expires_at = Date.now() + newTokens.expires_in * 1000;
        }

        if (!newTokens.refresh_token) {
          newTokens.refresh_token = user.tokens.refresh_token;
        }

        user = {
          ...user,
          tokens: newTokens,
        };

        await this.saveUser(user);
        console.log(
          `Token refreshed successfully. New expiration: ${new Date(newTokens.expires_at || 0).toISOString()}`
        );
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw new Error('Token refresh failed. User needs to re-authenticate.');
      }
    }

    return user.tokens.access_token;
  }
  async getLastSyncSnapshot(userId: string): Promise<SyncSnapshot | null> {
    const snapshot = await this.redis.get<SyncSnapshot>(
      `sync-snapshot:${userId}`
    );

    if (!snapshot) {
      return null;
    }

    return snapshot;
  }

  async saveLastSyncSnapshot(
    userId: string,
    snapshot: SyncSnapshot
  ): Promise<void> {
    await this.redis.set(`sync-snapshot:${userId}`, JSON.stringify(snapshot));
  }
}
