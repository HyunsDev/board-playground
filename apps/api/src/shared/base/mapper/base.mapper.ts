import { AbstractMapper } from '@workspace/backend-ddd';

import { BaseEntity } from '../blocks';

export abstract class BaseMapper<
  TEntity extends BaseEntity<unknown>,
  TRecord,
> extends AbstractMapper<TEntity, TRecord> {}
