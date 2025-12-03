import { BadRequestError, NotFoundError } from '@/shared/base';

export class SessionNotFoundError extends NotFoundError {
  readonly name = 'SessionNotFoundError';
  constructor() {
    super('Session not found', 'SESSION_NOT_FOUND');
  }
}

export class InvalidTokenError extends BadRequestError {
  readonly name = 'InvalidTokenError';
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}

export class InvalidRefreshTokenError extends BadRequestError {
  readonly name = 'InvalidRefreshTokenError';
  constructor() {
    super('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}

export class UsedRefreshTokenError extends BadRequestError {
  readonly name = 'UsedRefreshTokenError';
  constructor() {
    super('Used refresh token', 'USED_REFRESH_TOKEN');
  }
}

export class RefreshTokenExpiredError extends BadRequestError {
  readonly name = 'RefreshTokenExpiredError';
  constructor() {
    super('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
  }
}

export class SessionIsRevokedError extends BadRequestError {
  readonly name = 'SessionIsRevokedError';
  constructor() {
    super('Session is revoked', 'SESSION_IS_REVOKED');
  }
}
