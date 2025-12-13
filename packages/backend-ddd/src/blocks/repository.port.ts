import { AbstractEntity } from './abstract.entity';

export abstract class RepositoryPort<TEntity extends AbstractEntity<unknown>> {
  abstract findOneById(id: string): Promise<TEntity | null>;
}
