export interface UserTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number; // Seconds until expiration (from Google API)
  token_type?: string;
  expires_at?: number; // Absolute timestamp in milliseconds (calculated)
}

export interface OAuthTokenResponse extends UserTokens {
  scope?: string;
}
