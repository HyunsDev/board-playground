import { AbstractMapper } from '@workspace/backend-ddd';

import { BaseEntity } from '../blocks';

export abstract class BaseMapper<
  TEntity extends BaseEntity<unknown>,
  TRecord extends Record<string, unknown>,
> extends AbstractMapper<TEntity, TRecord> {}
