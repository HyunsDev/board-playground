export interface DomainErrorProps<T = unknown> {
  message: string;
  code: string;
  details?: T;
}

export class DomainError<T = unknown> {
  public readonly message: string;
  public readonly code: string;
  public readonly details?: T;

  constructor(public readonly props: DomainErrorProps<T>) {
    this.message = props.message;
    this.code = props.code;
    this.details = props.details;
  }
}

export class NotFoundError<T = unknown> extends DomainError<T> {
  constructor(message: string, code: string = 'NOT_FOUND', details?: T) {
    super({ message, code, details });
  }
}

export class ConflictError<T = unknown> extends DomainError<T> {
  constructor(message: string, code: string = 'CONFLICT', details?: T) {
    super({ message, code, details });
  }
}

export class AccessDeniedError<T = unknown> extends DomainError<T> {
  constructor(message: string, code: string = 'ACCESS_DENIED', details?: T) {
    super({ message, code, details });
  }
}

export class UnauthorizedError<T = unknown> extends DomainError<T> {
  constructor(message: string, code: string = 'UNAUTHORIZED', details?: T) {
    super({ message, code, details });
  }
}

export class ValidationError<T = unknown> extends DomainError<T> {
  constructor(message: string, code: string = 'VALIDATION_ERROR', details?: T) {
    super({ message, code, details });
  }
}
