import { ConflictError, NotFoundError } from './base.error';
import { Result } from '../types/result.type';

export interface RepositoryPort<Entity> {
  insert(entity: Entity): Promise<Result<Entity, ConflictError>>;
  findOneById(id: string): Promise<Entity | null>;
  update(entity: Entity): Promise<Result<Entity, NotFoundError | ConflictError>>;
  delete(entity: Entity): Promise<Result<void, NotFoundError>>;
}
