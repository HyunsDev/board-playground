import { DomainResult } from '../../types/result.type';
import { ConflictError, NotFoundError } from '../error/common.domain-errors';

export interface RepositoryPort<Entity> {
  save(entity: Entity): Promise<DomainResult<Entity, ConflictError | NotFoundError>>;
  findOneById(id: string): Promise<Entity | null>;
  delete(entity: Entity): Promise<DomainResult<void, NotFoundError>>;
}
