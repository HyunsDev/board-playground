import { EXCEPTION } from '@workspace/contract';

import { UnauthorizedException } from '@/shared/base';

export class InvalidTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.INVALID_TOKEN);
  }
}

export class ExpiredTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.EXPIRED_TOKEN);
  }
}

export class MissingTokenException extends UnauthorizedException {
  constructor() {
    super(EXCEPTION.AUTH.MISSING_TOKEN);
  }
}
