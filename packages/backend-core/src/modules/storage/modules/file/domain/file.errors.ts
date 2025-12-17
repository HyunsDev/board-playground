import { BaseBadRequestError, BaseInternalServerError } from '@workspace/backend-ddd';

export class StorageError extends BaseInternalServerError<'StorageError'> {
  readonly code = 'StorageError' as const;
  readonly scope = 'private';
  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

export class InvalidFileError extends BaseBadRequestError<'InvalidFileError'> {
  readonly code = 'InvalidFileError' as const;
  readonly scope = 'private';
  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}

export class FileNotFoundError extends BaseBadRequestError<'FileNotFoundError'> {
  readonly code = 'FileNotFoundError' as const;
  readonly scope = 'public';
  constructor(details?: unknown) {
    super('File not found', details);
  }
}

export class FileAlreadyExistsError extends BaseBadRequestError<'FileAlreadyExistsError'> {
  readonly code = 'FileAlreadyExistsError' as const;
  readonly scope = 'public';
  constructor(message: string, details?: unknown) {
    super(message, details);
  }
}
