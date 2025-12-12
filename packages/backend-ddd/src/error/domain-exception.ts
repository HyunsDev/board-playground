import { DomainError } from './base.domain-errors';

/**
 * return이 불가능한 상황에서 도메인 오류를 예외로 던질 때 사용하는 래핑 클래스
 */
export class DomainException<GlobalDomainError extends DomainError = DomainError> extends Error {
  readonly error: GlobalDomainError;
  constructor(readonly e: GlobalDomainError) {
    super(e.message);
    this.error = e;
    this.name = 'DomainException';
  }
}
