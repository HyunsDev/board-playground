export interface DomainErrorProps<T = unknown> {
  message: string;
  details?: T;
}

export abstract class DomainError<T = unknown> {
  public abstract readonly name: string;
  public readonly message: string;
  public readonly details?: T;

  constructor(public readonly props: DomainErrorProps<T>) {
    this.message = props.message;
    this.details = props.details;
  }
}

export abstract class NotFoundError<T = any> extends DomainError<T> {
  constructor(message: string = 'Not found', details?: T) {
    super({ message, details });
  }
}

export abstract class ConflictError<T = any> extends DomainError<T> {
  constructor(message: string = 'Conflict detected', details?: T) {
    super({ message, details });
  }
}

export abstract class AccessDeniedError<T = any> extends DomainError<T> {
  constructor(message: string = 'Access denied', details?: T) {
    super({ message, details });
  }
}

export abstract class UnauthorizedError<T = any> extends DomainError<T> {
  constructor(message: string = 'Unauthorized', details?: T) {
    super({ message, details });
  }
}

export abstract class ValidationError<T = any> extends DomainError<T> {
  constructor(message: string = 'Validation error', details?: T) {
    super({ message, details });
  }
}

export abstract class BadRequestError<T = any> extends DomainError<T> {
  constructor(message: string = 'Bad Request', details?: T) {
    super({ message, details });
  }
}
