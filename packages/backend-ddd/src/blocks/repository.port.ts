import { AbstractEntity } from './abstract.entity';

export abstract class RepositoryPort<TEntity extends AbstractEntity<any>> {
  abstract findOneById(id: string): Promise<TEntity | null>;
}
