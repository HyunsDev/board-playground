import { EXCEPTION } from '@workspace/contract';

import { BaseException, NotFoundException } from '@/shared/exceptions';

export class DeviceNotFoundException extends NotFoundException {
  code = EXCEPTION.DEVICE.NOT_FOUND.code;
  constructor() {
    super(EXCEPTION.DEVICE.NOT_FOUND.message, EXCEPTION.DEVICE.NOT_FOUND.code);
  }
}

export class InvalidTokenException extends BaseException {
  code = EXCEPTION.AUTH.INVALID_TOKEN.code;
  constructor() {
    super(EXCEPTION.AUTH.INVALID_TOKEN.message, EXCEPTION.AUTH.INVALID_TOKEN.code);
  }
}

export class ExpiredTokenException extends BaseException {
  code = EXCEPTION.AUTH.EXPIRED_TOKEN.code;
  constructor() {
    super(EXCEPTION.AUTH.EXPIRED_TOKEN.message, EXCEPTION.AUTH.EXPIRED_TOKEN.code);
  }
}
