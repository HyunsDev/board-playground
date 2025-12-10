export type SystemExceptionScope = 'private';

/**
 * 의도하지 않은 시스템 오류시 발생하는 예외
 */
export abstract class SystemException<
  Code extends string = string,
  Details = unknown,
> extends Error {
  public abstract readonly code: Code;
  public readonly scope: SystemExceptionScope = 'private';
  public readonly message: string;
  public readonly details?: Details;

  constructor(message: string, details?: Details) {
    super(message);
    this.message = message;
    this.details = details;
  }
}

export abstract class BaseInternalServerException<
  Code extends string = string,
  Details = unknown,
> extends SystemException<Code, Details> {}
