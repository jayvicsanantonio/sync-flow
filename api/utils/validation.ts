import { ValidationError } from './errors';

export interface WebhookPayload {
  title: string;
  notes?: string;
  due?: string;
}

export function validateWebhookPayload(data: any): WebhookPayload {
  if (!data || typeof data !== 'object') {
    throw new ValidationError(
      'Request body must be a valid JSON object'
    );
  }

  if (!data.title || typeof data.title !== 'string') {
    throw new ValidationError(
      'Title is required and must be a string'
    );
  }

  if (data.title.trim().length === 0) {
    throw new ValidationError('Title cannot be empty');
  }

  if (data.notes && typeof data.notes !== 'string') {
    throw new ValidationError('Notes must be a string if provided');
  }

  if (data.due && typeof data.due !== 'string') {
    throw new ValidationError(
      'Due date must be a string if provided'
    );
  }

  return {
    title: data.title.trim(),
    notes: data.notes?.trim(),
    due: data.due,
  };
}

export function validateUserId(userId: string | undefined): string {
  if (!userId || typeof userId !== 'string') {
    throw new ValidationError(
      'User ID is required and must be a string'
    );
  }

  if (userId.trim().length === 0) {
    throw new ValidationError('User ID cannot be empty');
  }

  return userId.trim();
}
