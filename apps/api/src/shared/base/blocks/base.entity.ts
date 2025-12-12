import {
  AbstractCreateEntityProps,
  AbstractEntity,
  AbstractEntityProps,
} from '@workspace/backend-ddd';

export type BaseEntityProps = AbstractEntityProps;
export type BaseCreateEntityProps<T> = AbstractCreateEntityProps<T>;
export abstract class BaseEntity<TProps> extends AbstractEntity<TProps> {}
