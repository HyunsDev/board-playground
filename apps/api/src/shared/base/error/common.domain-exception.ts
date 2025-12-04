import { DomainError } from './base.domain-errors';
import { DomainException } from './base.domain-exception';
import {
  ExpiredTokenError,
  InternalServerError,
  InvalidTokenError,
  MissingTokenError,
  UnexpectedDomainError,
} from './common.domain-errors';

export class InternalServerErrorException extends DomainException {
  constructor() {
    super(new InternalServerError());
  }
}

export class UnexpectedDomainErrorException extends DomainException {
  constructor(error: DomainError) {
    super(new UnexpectedDomainError(error));
  }
}

export class InvalidTokenException extends DomainException {
  constructor() {
    super(new InvalidTokenError());
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
