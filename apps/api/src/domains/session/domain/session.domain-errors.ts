import { BaseBadRequestError, BaseNotFoundError } from '@/shared/base';

export class SessionConflictError extends BaseBadRequestError<'SessionConflict'> {
  public readonly code = 'SessionConflict';
  public readonly scope = 'public';
  constructor() {
    super('Session conflict occurred');
  }
}

export class SessionNotFoundError extends BaseNotFoundError<'SessionNotFound'> {
  public readonly code = 'SessionNotFound';
  public readonly scope = 'public';
  constructor() {
    super('Session not found');
  }
}

export class SessionIsRevokedError extends BaseBadRequestError<'SessionIsRevoked'> {
  public readonly code = 'SessionIsRevoked';
  public readonly scope = 'public';
  readonly name = 'SessionIsRevokedError';
  constructor() {
    super('Session is revoked');
  }
}

export class CurrentSessionCannotBeDeletedError extends BaseBadRequestError<'CurrentSessionCannotBeDeleted'> {
  public readonly code = 'CurrentSessionCannotBeDeleted';
  public readonly scope = 'public';
  constructor() {
    super('Current session cannot be deleted');
  }
}
