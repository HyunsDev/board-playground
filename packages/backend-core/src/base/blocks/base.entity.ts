import {
  AbstractCreateEntityProps,
  AbstractEntity,
  AbstractEntityProps,
} from '@workspace/backend-ddd';
import { ModelId } from '@workspace/domain';

export type BaseEntityProps = AbstractEntityProps<ModelId>;
export type BaseCreateEntityProps<T, TId extends ModelId> = AbstractCreateEntityProps<T, TId>;
export abstract class BaseEntity<TProps, TId extends ModelId> extends AbstractEntity<TProps, TId> {}
