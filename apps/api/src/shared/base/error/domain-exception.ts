import { GlobalDomainError } from '@/infra/exception-filter/global-domain-error.type';

export class DomainException extends Error {
  constructor(public readonly error: GlobalDomainError) {
    super(error.message);
    this.name = 'DomainException';
  }
}
