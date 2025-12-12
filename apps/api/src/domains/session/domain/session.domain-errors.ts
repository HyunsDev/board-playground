import { BaseBadRequestError, BaseNotFoundError } from '@workspace/backend-ddd';

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

export class SessionRevokedError extends BaseBadRequestError<'SessionRevoked'> {
  public readonly code = 'SessionRevoked';
  public readonly scope = 'public';
  readonly name = 'SessionRevokedError';
  constructor() {
    super('Session is revoked');
  }
}

export class SessionClosedError extends BaseBadRequestError<'SessionClosed'> {
  public readonly code = 'SessionClosed';
  public readonly scope = 'public';
  readonly name = 'SessionClosedError';
  constructor() {
    super('Session is closed');
  }
}

export class CurrentSessionCannotBeDeletedError extends BaseBadRequestError<'CurrentSessionCannotBeDeleted'> {
  public readonly code = 'CurrentSessionCannotBeDeleted';
  public readonly scope = 'public';
  constructor() {
    super('Current session cannot be deleted');
  }
}
