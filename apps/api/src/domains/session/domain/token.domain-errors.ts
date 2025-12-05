import { BaseBadRequestError, BaseNotFoundError } from '@/shared/base';

export class RefreshTokenNotFoundError extends BaseNotFoundError<'RefreshTokenNotFound'> {
  public readonly code = 'RefreshTokenNotFound';
  public readonly scope = 'private';
  constructor() {
    super('Refresh token not found');
  }
}

export class InvalidRefreshTokenError extends BaseBadRequestError<'InvalidRefreshToken'> {
  public readonly code = 'InvalidRefreshToken';
  public readonly scope = 'public';
  constructor() {
    super('Invalid refresh token');
  }
}

export class UsedRefreshTokenError extends BaseBadRequestError<'UsedRefreshToken'> {
  public readonly code = 'UsedRefreshToken';
  public readonly scope = 'public';
  constructor() {
    super('Used refresh token');
  }
}

export class RefreshTokenConflictError extends BaseBadRequestError<'RefreshTokenConflict'> {
  public readonly code = 'RefreshTokenConflict';
  public readonly scope = 'public';
  constructor() {
    super('Refresh token conflict occurred');
  }
}

export class RefreshTokenExpiredError extends BaseBadRequestError<'RefreshTokenExpired'> {
  public readonly code = 'RefreshTokenExpired';
  public readonly scope = 'public';
  constructor() {
    super('Refresh token expired');
  }
}
