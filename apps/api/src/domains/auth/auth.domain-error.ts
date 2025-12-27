import { BaseBadRequestError } from '@workspace/backend-ddd';

export class InvalidCredentialsError extends BaseBadRequestError<'InvalidCredentials'> {
  public readonly code = 'InvalidCredentials';
  public readonly scope = 'public';
  constructor() {
    super('Invalid credentials');
  }
}

export class InvalidEmailVerificationCodeError extends BaseBadRequestError<'InvalidEmailVerificationCode'> {
  public readonly code = 'InvalidEmailVerificationCode';
  public readonly scope = 'public';
  constructor() {
    super('유효하지 않은 이메일 인증 코드입니다');
  }
}
