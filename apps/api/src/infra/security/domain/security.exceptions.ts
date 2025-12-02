import { EXCEPTION } from '@workspace/contract';

import { UnauthorizedException } from '@/shared/base';

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.INVALID_TOKEN.message, EXCEPTION.AUTH.INVALID_TOKEN.code);
  }
}

export class ExpiredTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.EXPIRED_TOKEN.message, EXCEPTION.AUTH.EXPIRED_TOKEN.code);
  }
}

export class MissingTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.MISSING_TOKEN.message, EXCEPTION.AUTH.MISSING_TOKEN.code);
  }
}
