import { BaseBadRequestError } from '@workspace/backend-ddd';

export class InvalidCredentialsError extends BaseBadRequestError<'InvalidCredentials'> {
  public readonly code = 'InvalidCredentials';
  public readonly scope = 'public';
  constructor() {
    super('Invalid credentials');
  }
}
