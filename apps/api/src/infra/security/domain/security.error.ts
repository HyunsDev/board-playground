import { EXCEPTION } from '@workspace/contract';

import { BadRequestError } from '@/shared/base';

export class InvalidCredentialsError extends BadRequestError {
  constructor() {
    super(EXCEPTION.AUTH.INVALID_CREDENTIALS.message, EXCEPTION.AUTH.INVALID_CREDENTIALS.code);
  }
}
