export interface UserTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface OAuthTokenResponse extends UserTokens {
  scope?: string;
}
