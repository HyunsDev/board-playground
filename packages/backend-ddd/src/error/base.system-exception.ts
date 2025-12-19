export type SystemExceptionScope = 'private';

/**
 * 의도하지 않은 시스템 오류시 발생하는 예외
 */
export abstract class SystemException<
  Code extends string = string,
  Details = unknown,
> extends Error {
  abstract readonly code: Code;
  readonly scope: SystemExceptionScope = 'private';
  readonly message: string;
  readonly details?: Details;

  constructor(message: string, details?: Details, cause?: unknown) {
    super(message, { cause });
    this.message = message;
    this.details = details;
  }
}

export abstract class BaseInternalServerException<
  Code extends string = string,
  Details = unknown,
> extends SystemException<Code, Details> {}
