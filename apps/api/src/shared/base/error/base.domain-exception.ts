import { GlobalDomainError } from '@/infra/exception-filter/domain-exception.filter';

export class DomainException extends Error {
  constructor(public readonly error: GlobalDomainError) {
    super(error.message);
    this.name = 'DomainException';
  }
}
