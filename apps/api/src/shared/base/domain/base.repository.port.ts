import { DomainResult } from '../../types/result.type';
import { ConflictError, NotFoundError } from '../error/common.domain-errors';

export interface RepositoryPort<Entity> {
  insert(entity: Entity): Promise<DomainResult<Entity, ConflictError>>;
  findOneById(id: string): Promise<Entity | null>;
  update(entity: Entity): Promise<DomainResult<Entity, NotFoundError | ConflictError>>;
  delete(entity: Entity): Promise<DomainResult<void, NotFoundError>>;
}
