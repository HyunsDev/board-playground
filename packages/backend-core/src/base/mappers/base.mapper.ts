import { AbstractMapper } from '@workspace/backend-ddd';
import { ModelId } from '@workspace/domain';

import { BaseEntity } from '../blocks';

export abstract class BaseMapper<
  TEntity extends BaseEntity<unknown, ModelId>,
  TRecord extends Record<string, unknown>,
> extends AbstractMapper<TEntity, TRecord> {}
