import { BadRequestError, NotFoundError } from '@/shared/base';

export class SessionNotFoundError extends NotFoundError {
  constructor() {
    super('Session not found', 'SESSION_NOT_FOUND');
  }
}

export class InvalidTokenError extends BadRequestError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}

export class InvalidRefreshTokenError extends BadRequestError {
  constructor() {
    super('Invalid refresh token', 'INVALID_REFRESH_TOKEN');
  }
}

export class UsedRefreshTokenError extends BadRequestError {
  constructor() {
    super('Used refresh token', 'USED_REFRESH_TOKEN');
  }
}

export class RefreshTokenExpiredError extends BadRequestError {
  constructor() {
    super('Refresh token expired', 'REFRESH_TOKEN_EXPIRED');
  }
}

export class SessionIsRevokedError extends BadRequestError {
  constructor() {
    super('Session is revoked', 'SESSION_IS_REVOKED');
  }
}
