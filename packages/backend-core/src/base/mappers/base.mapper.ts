import { AbstractMapper } from '@workspace/backend-ddd';
import { Id } from '@workspace/domain';

import { BaseEntity } from '../blocks';

export abstract class BaseMapper<
  TEntity extends BaseEntity<unknown, Id>,
  TRecord extends Record<string, unknown>,
> extends AbstractMapper<TEntity, TRecord> {}
