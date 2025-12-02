import { DomainError } from './base.domain-error';

export class NotFoundError<T = any> extends DomainError<T> {
  constructor(message: string = 'Not found', code: string = 'NOT_FOUND', details?: T) {
    super({ message, code, details });
  }
}

export interface ConflictErrorDetail {
  field: string;
  value?: string;
}

export class ConflictError extends DomainError<ConflictErrorDetail[]> {
  constructor(
    message: string = 'Conflict detected',
    code: string = 'CONFLICT',
    details?: ConflictErrorDetail[],
  ) {
    super({
      message,
      code,
      details, // [{ field: 'email', value: 'a@b.com' }] 형태
    });
  }
}

export class AccessDeniedError<T = any> extends DomainError<T> {
  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED', details?: T) {
    super({ message, code, details });
  }
}

export class UnauthorizedError<T = any> extends DomainError<T> {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED', details?: T) {
    super({ message, code, details });
  }
}

export class ValidationError<T = any> extends DomainError<T> {
  constructor(
    details?: T,
    message: string = 'Validation error',
    code: string = 'VALIDATION_ERROR',
  ) {
    super({ message, code, details });
  }
}

export class BadRequestError<T = any> extends DomainError<T> {
  constructor(message: string = 'Bad Request', code: string = 'BAD_REQUEST', details?: T) {
    super({ message, code, details });
  }
}
