import { EXCEPTION } from '@workspace/contract';

import { BadRequestError, ConflictError, NotFoundError } from '@/shared/base';

export class UserAdminCannotBeDeletedError extends BadRequestError {
  readonly name = 'UserAdminCannotBeDeletedError';
  constructor() {
    super(
      EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED.message,
      EXCEPTION.USER.ADMIN_CANNOT_BE_DELETED.code,
    );
  }
}

export class UserNotFoundError extends NotFoundError {
  readonly name = 'UserNotFoundError';
  constructor() {
    super(EXCEPTION.USER.NOT_FOUND.message, EXCEPTION.USER.NOT_FOUND.code);
  }
}

export class UserEmailAlreadyExistsError extends ConflictError {
  readonly name = 'UserEmailAlreadyExistsError';
  constructor() {
    super(EXCEPTION.USER.EMAIL_ALREADY_EXISTS.message, EXCEPTION.USER.EMAIL_ALREADY_EXISTS.code);
  }
}

export class UserUsernameAlreadyExistsError extends ConflictError {
  readonly name = 'UserUsernameAlreadyExistsError';
  constructor() {
    super(
      EXCEPTION.USER.USERNAME_ALREADY_EXISTS.message,
      EXCEPTION.USER.USERNAME_ALREADY_EXISTS.code,
    );
  }
}
