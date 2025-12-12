import { DomainErrorScope } from './error.types';

/**
 * 비즈니스 로직에 의해서 발생하는 오류
 * - DomainError는 Err로 return 되어야 하며, throw 되어서는 안된다.
 */
export abstract class DomainError<Code extends string = string, Details = unknown> {
  public abstract readonly code: Code;
  public abstract readonly scope: DomainErrorScope;
  public readonly message: string;
  public readonly details?: Details;

  constructor(message: string, details?: Details) {
    this.message = message;
    this.details = details;
  }
}

export abstract class AbstractNotFoundError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class AbstractConflictError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class AbstractAccessDeniedError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class AbstractUnauthorizedError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class AbstractValidationError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class AbstractBadRequestError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}
