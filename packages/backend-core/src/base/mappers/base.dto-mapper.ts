import { AbstractDtoMapper } from '@workspace/backend-ddd';
import { ModelId } from '@workspace/domain';

import { BaseEntity } from '../blocks';

export abstract class BaseDtoMapper<
  TEntity extends BaseEntity<unknown, ModelId>,
> extends AbstractDtoMapper<TEntity> {}
