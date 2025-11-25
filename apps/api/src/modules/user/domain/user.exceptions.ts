import { EXCEPTION } from '@workspace/contract';

import { BaseException, NotFoundException } from '@/libs/exceptions';

export class UserAdminCannotBeDeletedException extends BaseException {
  code = EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED.code;
  constructor() {
    super(
      EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED.message,
      EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED.code,
    );
  }
}

export class UserNotFoundException extends NotFoundException {
  code = EXCEPTION.USER.NOT_FOUND.code;
  constructor() {
    super(EXCEPTION.USER.NOT_FOUND.message, EXCEPTION.USER.NOT_FOUND.code);
  }
}
