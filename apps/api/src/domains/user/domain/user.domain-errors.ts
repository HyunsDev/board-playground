import { BaseBadRequestError, BaseConflictError, BaseNotFoundError } from '@workspace/backend-ddd';

export class UserAdminCannotBeDeletedError extends BaseBadRequestError<'UserAdminCannotBeDeleted'> {
  public readonly code = 'UserAdminCannotBeDeleted';
  public readonly scope = 'public';
  constructor() {
    super('The admin user cannot be deleted from the system');
  }
}

export class UserNotFoundError extends BaseNotFoundError<'UserNotFound'> {
  public readonly code = 'UserNotFound';
  public readonly scope = 'public';
  constructor() {
    super('The user was not found in the system');
  }
}

export class UserEmailAlreadyExistsError extends BaseConflictError<'UserEmailAlreadyExists'> {
  public readonly code = 'UserEmailAlreadyExists';
  public readonly scope = 'public';
  constructor() {
    super('The email address is already in use by another user');
  }
}

export class UserUsernameAlreadyExistsError extends BaseConflictError<'UserUsernameAlreadyExists'> {
  public readonly code = 'UserUsernameAlreadyExists';
  public readonly scope = 'public';
  constructor() {
    super('The username is already in use by another user');
  }
}
