import { DomainError } from './abstract.domain-errors';

/**
 * return이 불가능한 상황에서 도메인 오류를 예외로 던질 때 사용하는 래핑 클래스
 */
export class DomainException<GlobalDomainError extends DomainError> extends Error {
  constructor(public readonly error: GlobalDomainError) {
    super(error.message);
    this.name = 'DomainException';
  }
}
