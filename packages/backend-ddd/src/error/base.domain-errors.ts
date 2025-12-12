import { DomainErrorScope } from './error.types';

/**
 * 비즈니스 로직에 의해서 발생하는 오류
 * - DomainError는 Err로 return 되어야 하며, throw 되어서는 안된다.
 */
export abstract class DomainError<Code extends string = string, Details = unknown> {
  abstract readonly code: Code;
  abstract readonly scope: DomainErrorScope;
  readonly message: string;
  readonly details?: Details;

  constructor(message: string, details?: Details) {
    this.message = message;
    this.details = details;
  }
}

export abstract class BaseNotFoundError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class BaseConflictError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class BaseAccessDeniedError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class BaseUnauthorizedError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class BaseValidationError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}

export abstract class BaseBadRequestError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}
