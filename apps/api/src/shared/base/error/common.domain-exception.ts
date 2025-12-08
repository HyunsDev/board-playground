import { DomainError } from './base.domain-errors';
import { DomainException } from './base.domain-exception';
import {
  ExpiredTokenError,
  InternalServerError,
  InvalidAccessTokenError,
  MissingTokenError,
  UnexpectedDomainError,
} from './common.domain-errors';

export class InternalServerErrorException extends DomainException {
  constructor(message?: string, details?: any) {
    super(new InternalServerError(message, details));
  }
}

export class UnexpectedDomainErrorException extends DomainException {
  constructor(error: DomainError) {
    super(new UnexpectedDomainError(error));
  }
}

export class InvalidAccessTokenException extends DomainException {
  constructor() {
    super(new InvalidAccessTokenError());
  }
}

export class ExpiredTokenException extends DomainException {
  constructor() {
    super(new ExpiredTokenError());
  }
}

export class MissingTokenException extends DomainException {
  constructor() {
    super(new MissingTokenError());
  }
}
