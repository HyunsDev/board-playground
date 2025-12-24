import { BaseNotFoundError } from '@workspace/backend-ddd';

export class BoardNotFoundError extends BaseNotFoundError<'BoardNotFound'> {
  public readonly code = 'BoardNotFound';
  public readonly scope = 'public';
  constructor() {
    super('The board was not found in the system');
  }
}

export class BoardSlugAlreadyExistsError extends BaseNotFoundError<'BoardSlugAlreadyExists'> {
  public readonly code = 'BoardSlugAlreadyExists';
  public readonly scope = 'public';
  constructor() {
    super('The board slug is already in use by another board');
  }
}
