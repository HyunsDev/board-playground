import { EXCEPTION } from '@workspace/contract';

import { BaseException, NotFoundException } from '@/shared/exceptions';

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

export class UserEmailAlreadyExistsException extends BaseException {
  code = EXCEPTION.USER.EMAIL_ALREADY_EXISTS.code;
  constructor() {
    super(EXCEPTION.USER.EMAIL_ALREADY_EXISTS.message, EXCEPTION.USER.EMAIL_ALREADY_EXISTS.code);
  }
}

export class UserUsernameAlreadyExistsException extends BaseException {
  code = EXCEPTION.USER.USERNAME_ALREADY_EXISTS.code;
  constructor() {
    super(
      EXCEPTION.USER.USERNAME_ALREADY_EXISTS.message,
      EXCEPTION.USER.USERNAME_ALREADY_EXISTS.code,
    );
  }
}
