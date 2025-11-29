import { DomainError } from './base.error';

export class NotFoundError<T = unknown> extends DomainError<T> {
  constructor(message: string = 'Not found', code: string = 'NOT_FOUND', details?: T) {
    super({ message, code, details });
  }
}

export interface ConflictErrorDetail {
  field: string;
  value?: string;
}

export class ConflictError extends DomainError<ConflictErrorDetail[]> {
  constructor(details?: ConflictErrorDetail[], message: string = 'Conflict detected') {
    super({
      message,
      code: 'CONFLICT',
      details, // [{ field: 'email', value: 'a@b.com' }] 형태
    });
  }
}

export class AccessDeniedError<T = unknown> extends DomainError<T> {
  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED', details?: T) {
    super({ message, code, details });
  }
}

export class UnauthorizedError<T = unknown> extends DomainError<T> {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED', details?: T) {
    super({ message, code, details });
  }
}

export class ValidationError<T = unknown> extends DomainError<T> {
  constructor(
    details?: T,
    message: string = 'Validation error',
    code: string = 'VALIDATION_ERROR',
  ) {
    super({ message, code, details });
  }
}
