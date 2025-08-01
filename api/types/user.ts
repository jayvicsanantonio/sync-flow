import type { UserTokens } from './auth';

export interface UserProfile {
  email: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export interface User {
  id: string;
  tokens: UserTokens;
  syncedTaskIds: string[];
  profile: UserProfile;
}
