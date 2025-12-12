/* eslint-disable @typescript-eslint/no-explicit-any */
import { DomainError } from './base.domain-errors';
import { BaseInternalServerException } from './base.system-exception';

export class InternalServerErrorException extends BaseInternalServerException<
  'InternalServerError',
  any
> {
  readonly code = 'InternalServerError';
  constructor(message?: string, details?: any) {
    super(message ?? 'An internal server error occurred', details);
  }
}

/**
 * 도메인 에러 처리 과정에서 사전에 정의하지 않은 도메인 에러가 처리될 경우 던져집니다
 */
export class UnexpectedDomainErrorException extends BaseInternalServerException<
  'UnexpectedDomainError',
  { error: DomainError }
> {
  readonly code = 'UnexpectedDomainError';
  constructor(error: DomainError) {
    super('An unexpected domain error occurred', {
      error: error,
    });
  }
}

/**
 * 타입 시스템 상 발생하지 않아야 하는 불변식 위반 상황이 발생했음을 나타냅니다
 */
export class InvariantViolationException extends BaseInternalServerException<
  'InvariantViolation',
  any
> {
  readonly code = 'InvariantViolation';
  constructor(message?: string, details?: any) {
    super(message ?? 'An invariant violation occurred', details);
  }
}

export type GlobalSystemException =
  | InternalServerErrorException
  | UnexpectedDomainErrorException
  | InvariantViolationException;
