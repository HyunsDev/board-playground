export interface BaseErrorProps<T = unknown> {
  message: string;
  code: string;
  details?: T;
}

export class BaseError<T = unknown> {
  public readonly message: string;
  public readonly code: string;
  public readonly details?: T;

  constructor(public readonly props: BaseErrorProps<T>) {
    this.message = props.message;
    this.code = props.code;
    this.details = props.details;
  }
}

export class NotFoundError<T = unknown> extends BaseError<T> {
  constructor(message: string = 'Not found', code: string = 'NOT_FOUND', details?: T) {
    super({ message, code, details });
  }
}

export interface ConflictErrorDetail {
  field: string;
  value?: string;
}

export class ConflictError extends BaseError<ConflictErrorDetail[]> {
  constructor(details?: ConflictErrorDetail[], message: string = 'Conflict detected') {
    super({
      message,
      code: 'CONFLICT',
      details, // [{ field: 'email', value: 'a@b.com' }] 형태
    });
  }
}

export class AccessDeniedError<T = unknown> extends BaseError<T> {
  constructor(message: string = 'Access denied', code: string = 'ACCESS_DENIED', details?: T) {
    super({ message, code, details });
  }
}

export class UnauthorizedError<T = unknown> extends BaseError<T> {
  constructor(message: string = 'Unauthorized', code: string = 'UNAUTHORIZED', details?: T) {
    super({ message, code, details });
  }
}

export class ValidationError<T = unknown> extends BaseError<T> {
  constructor(
    details?: T,
    message: string = 'Validation error',
    code: string = 'VALIDATION_ERROR',
  ) {
    super({ message, code, details });
  }
}
