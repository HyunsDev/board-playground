import { BaseNotFoundError } from '@workspace/backend-ddd';

export class FileReferenceNotFoundError extends BaseNotFoundError {
  readonly code = 'FILE_REFERENCE_NOT_FOUND';
  readonly scope = 'public';
  constructor(message = 'File reference not found', details?: unknown) {
    super(message, details);
  }
}

export class InvalidFileReferenceError extends BaseNotFoundError {
  readonly code = 'INVALID_FILE_REFERENCE';
  readonly scope = 'private';
  constructor(message = 'Invalid file reference', details?: unknown) {
    super(message, details);
  }
}
