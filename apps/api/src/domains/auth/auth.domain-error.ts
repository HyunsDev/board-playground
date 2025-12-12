import { BaseBadRequestError } from '@/shared/base';

export class InvalidCredentialsError extends BaseBadRequestError<'InvalidCredentials'> {
  public readonly code = 'InvalidCredentials';
  public readonly scope = 'public';
  constructor() {
    super('Invalid credentials');
  }
}
