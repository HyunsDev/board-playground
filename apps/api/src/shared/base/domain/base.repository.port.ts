import { DomainResult } from '../../types/result.type';
import { EntityConflictError, EntityNotFoundError } from '../error/common.domain-errors';

export interface RepositoryPort<Entity> {
  save(entity: Entity): Promise<DomainResult<Entity, EntityConflictError | EntityNotFoundError>>;
  findOneById(id: string): Promise<Entity | null>;
  delete(entity: Entity): Promise<DomainResult<void, EntityNotFoundError>>;
}
