import { Result } from '../../types/result.type';
import { ConflictError, NotFoundError } from '../error/base.error';

export interface RepositoryPort<Entity> {
  insert(entity: Entity): Promise<Result<Entity, ConflictError>>;
  findOneById(id: string): Promise<Entity | null>;
  update(entity: Entity): Promise<Result<Entity, NotFoundError | ConflictError>>;
  delete(entity: Entity): Promise<Result<void, NotFoundError>>;
}
