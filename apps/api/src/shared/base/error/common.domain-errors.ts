import { ValidationDetails } from '@workspace/contract';

import {
  BaseAccessDeniedError,
  BaseBadRequestError,
  BaseConflictError,
  BaseInternalServerError,
  BaseNotFoundError,
  BaseValidationError,
  DomainError,
} from './base.domain-errors';

export class EntityNotFoundError extends BaseNotFoundError<
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
export class EntityConflictError extends BaseConflictError<
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
export class ValidationError extends BaseValidationError<'ValidationError', ValidationDetails> {
  public readonly code = 'ValidationError';
  public readonly scope = 'public';
  constructor(details?: ValidationDetails) {
    super('A validation error occurred', details);
  }
}

export class AccessDeniedError extends BaseAccessDeniedError<'AccessDenied'> {
  public readonly code = 'AccessDenied';
  public readonly scope = 'public';
  constructor() {
    super('Access denied');
  }
}

export class InternalServerError extends BaseInternalServerError<'InternalServerError', any> {
  public readonly code = 'InternalServerError';
  public readonly scope = 'public';
  constructor(message?: string, details?: any) {
    super(message ?? 'An internal server error occurred', details);
  }
}

export class UnexpectedDomainError extends BaseInternalServerError<
  'UnexpectedDomainError',
  { error: DomainError }
> {
  public readonly code = 'UnexpectedDomainError';
  public readonly scope = 'public';
  constructor(error: DomainError) {
    super('An unexpected domain error occurred', {
      error: error,
    });
  }
}

export class InvalidAccessTokenError extends BaseBadRequestError<'InvalidAccessToken'> {
  public readonly code = 'InvalidAccessToken';
  public readonly scope = 'public';
  constructor() {
    super('Invalid access token');
  }
}

export class ExpiredTokenError extends BaseBadRequestError<'ExpiredToken'> {
  public readonly code = 'ExpiredToken';
  public readonly scope = 'public';
  constructor() {
    super('Token expired');
  }
}

export class MissingTokenError extends BaseBadRequestError<'MissingToken'> {
  public readonly code = 'MissingToken';
  public readonly scope = 'public';
  constructor() {
    super('Missing token');
  }
}
