import { EXCEPTION } from '@workspace/contract';

import { BadRequestError } from '@/shared/base';

export class InvalidCredentialsError extends BadRequestError {
  readonly name = 'InvalidCredentialsError';
  constructor() {
    super(EXCEPTION.AUTH.INVALID_CREDENTIALS.message, EXCEPTION.AUTH.INVALID_CREDENTIALS.code);
  }
}
