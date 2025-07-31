export class SyncFlowError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'SyncFlowError';
  }
}

export class AuthenticationError extends SyncFlowError {
  constructor(message: string = 'Authentication required') {
    super(message, 'AUTHENTICATION_ERROR', 401);
  }
}

export class ValidationError extends SyncFlowError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
  }
}

export class NotFoundError extends SyncFlowError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

export class GoogleAPIError extends SyncFlowError {
  constructor(
    message: string,
    public apiResponse?: any,
    public statusCode: number = 500
  ) {
    super(message, 'GOOGLE_API_ERROR', statusCode, apiResponse);
  }
}
