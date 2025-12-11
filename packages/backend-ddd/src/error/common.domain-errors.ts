import { ValidationDetails } from '@workspace/common';

import {
  AbstractAccessDeniedError,
  AbstractBadRequestError,
  AbstractConflictError,
  AbstractNotFoundError,
  AbstractValidationError,
} from './abstract.domain-errors';

export class EntityNotFoundError extends AbstractNotFoundError<
  'EntityNotFound',
  EntityNotFoundErrorDetails
> {
  public readonly code = 'EntityNotFound';
  public readonly scope = 'private';
  constructor(details: EntityNotFoundErrorDetails) {
    super(`Entity ${details.entityName} not found`, details);
  }
}
export interface EntityNotFoundErrorDetails {
  entityName?: string;
  entityId?: string | number;
}

export interface EntityConflictInfo {
  field: string;
  value?: any;
}

export interface EntityConflictErrorDetails {
  entityName?: string;
  conflicts: EntityConflictInfo[];
}
export class EntityConflictError extends AbstractConflictError<
  'EntityConflict',
  EntityConflictErrorDetails
> {
  public readonly code = 'EntityConflict';
  public readonly scope = 'private';
  constructor(details: EntityConflictErrorDetails) {
    super(`Entity ${details.entityName} has conflicts`, details);
  }
}

/**
 * 주의: 사용자 Request Validation의 에러는 ts-rest가 이 클래스가 아닌 RequestValidationError 클래스를 던집니다.
 */
export class ValidationError extends AbstractValidationError<'ValidationError', ValidationDetails> {
  public readonly code = 'ValidationError';
  public readonly scope = 'public';
  constructor(details?: ValidationDetails) {
    super('A validation error occurred', details);
  }
}

export class AccessDeniedError extends AbstractAccessDeniedError<'AccessDenied'> {
  public readonly code = 'AccessDenied';
  public readonly scope = 'public';
  constructor() {
    super('Access denied');
  }
}

export class InvalidAccessTokenError extends AbstractBadRequestError<'InvalidAccessToken'> {
  public readonly code = 'InvalidAccessToken';
  public readonly scope = 'public';
  constructor() {
    super('Invalid access token');
  }
}

export class ExpiredTokenError extends AbstractBadRequestError<'ExpiredToken'> {
  public readonly code = 'ExpiredToken';
  public readonly scope = 'public';
  constructor() {
    super('Token expired');
  }
}

export class MissingTokenError extends AbstractBadRequestError<'MissingToken'> {
  public readonly code = 'MissingToken';
  public readonly scope = 'public';
  constructor() {
    super('Missing token');
  }
}
