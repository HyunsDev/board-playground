export abstract class DomainError<Code extends string = string, Details = unknown> {
  public abstract readonly code: Code;
  public abstract readonly scope: 'public' | 'private';
  public readonly message: string;
  public readonly details?: Details;

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

export abstract class BaseInternalServerError<
  Code extends string = string,
  Details = unknown,
> extends DomainError<Code, Details> {}
