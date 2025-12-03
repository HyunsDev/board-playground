import { DomainError } from './base.domain-error';

export class EntityNotFoundError extends DomainError<{
  entityName?: string;
  entityId?: string | number;
}> {
  public readonly name = 'EntityNotFoundError';
  constructor(details: { entityName?: string; entityId?: string | number }) {
    super({
      message: `Entity ${details.entityName} with ID ${details.entityId} not found`,
      details,
    });
  }
}

export interface EntityConflictDetail {
  field: string;
  value?: string;
}

export class EntityConflictError extends DomainError<{
  entityName?: string;
  conflicts: EntityConflictDetail[];
}> {
  public readonly name = 'EntityConflictError';
  constructor(details: { entityName?: string; conflicts: EntityConflictDetail[] }) {
    super({
      message: `Conflict detected for entity ${details.entityName}`,
      details,
    });
  }
}
