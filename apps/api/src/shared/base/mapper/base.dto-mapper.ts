import { AbstractDtoMapper } from '@workspace/backend-ddd';

import { BaseEntity } from '../blocks';

export abstract class BaseDtoMapper<
  TEntity extends BaseEntity<unknown>,
> extends AbstractDtoMapper<TEntity> {}
