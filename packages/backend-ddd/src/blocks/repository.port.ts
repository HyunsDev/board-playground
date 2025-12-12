import { AbstractEntity } from './abstract.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export abstract class RepositoryPort<TEntity extends AbstractEntity<any>> {
  abstract findOneById(id: string): Promise<TEntity | null>;
}
