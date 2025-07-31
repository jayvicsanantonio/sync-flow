const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SERVER_BASE_URL } =
  process.env;

export const GOOGLE_SCOPES = {
  USERINFO_EMAIL: 'https://www.googleapis.com/auth/userinfo.email',
  USERINFO_PROFILE:
    'https://www.googleapis.com/auth/userinfo.profile',
  TASKS: 'https://www.googleapis.com/auth/tasks',
  TASKS_READONLY: 'https://www.googleapis.com/auth/tasks.readonly',
} as const;

export const config = {
  runtime: 'edge' as const,
  google: {
    clientId: GOOGLE_CLIENT_ID!,
    clientSecret: GOOGLE_CLIENT_SECRET!,
    redirectUrl: `${SERVER_BASE_URL}/api/auth/google/callback`,
    scopes: [
      GOOGLE_SCOPES.TASKS,
      GOOGLE_SCOPES.TASKS_READONLY,
      GOOGLE_SCOPES.USERINFO_EMAIL,
      GOOGLE_SCOPES.USERINFO_PROFILE,
    ],
  },
  api: {
    baseUrl: SERVER_BASE_URL!,
  },
} as const;
