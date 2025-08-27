import type { UserTokens } from './auth';

export interface UserProfile {
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface TaskMapping {
  googleTaskId: string;
  createdAt: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  tokens: UserTokens;
  syncedTaskIds: string[]; // Keep for backward compatibility
  taskMappings?: Record<string, TaskMapping>; // New mapping structure
  profile: UserProfile;
  lastSyncTime?: string; // RFC 3339 timestamp of last sync
}
