import { BrandId } from '@workspace/common';

import { AbstractEntity } from './abstract.entity';

export abstract class RepositoryPort<TEntity extends AbstractEntity<unknown, BrandId>> {
  abstract findOneById(id: string): Promise<TEntity | null>;
}
