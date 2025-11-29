import { EXCEPTION } from '@workspace/contract';

import { BaseException } from '@/shared/exceptions';

export class InvalidCredentialsException extends BaseException {
  code = EXCEPTION.AUTH.INVALID_CREDENTIALS.code;
  constructor() {
    super(EXCEPTION.AUTH.INVALID_CREDENTIALS.message, EXCEPTION.AUTH.INVALID_CREDENTIALS.code);
  }
}
