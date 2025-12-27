import { BrandId } from '@workspace/common';

import { AbstractEntity } from './abstract.entity';

import { DomainResultAsync } from '@/error';

export abstract class RepositoryPort<TEntity extends AbstractEntity<unknown, BrandId>> {
  abstract findOneById(id: string): DomainResultAsync<TEntity | null, never>;
}
