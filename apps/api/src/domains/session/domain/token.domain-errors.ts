import { BaseBadRequestError } from '@workspace/backend-ddd';

export class InvalidRefreshTokenError extends BaseBadRequestError<'InvalidRefreshToken'> {
  public readonly code = 'InvalidRefreshToken';
  public readonly scope = 'public';
  constructor() {
    super('Invalid refresh token');
  }
}

export class TokenReuseDetectedError extends BaseBadRequestError<'TokenReuseDetected'> {
  public readonly code = 'TokenReuseDetected';
  public readonly scope = 'public';
  constructor() {
    super('Token reuse detected');
  }
}

export class RefreshTokenExpiredError extends BaseBadRequestError<'RefreshTokenExpired'> {
  public readonly code = 'RefreshTokenExpired';
  public readonly scope = 'public';
  constructor() {
    super('Refresh token expired');
  }
}
