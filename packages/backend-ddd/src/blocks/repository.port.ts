import { AbstractEntity } from './abstract.entity';

export interface RepositoryPort<Entity extends AbstractEntity<any>> {
  findOneById(id: string): Promise<Entity | null>;
}
