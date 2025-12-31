import {
  AbstractCreateEntityProps,
  AbstractEntity,
  AbstractEntityProps,
} from '@workspace/backend-ddd';
import { Id } from '@workspace/domain';

export type BaseEntityProps<TId extends Id = Id> = AbstractEntityProps<TId>;
export type BaseCreateEntityProps<T, TId extends Id> = AbstractCreateEntityProps<T, TId>;
export abstract class BaseEntity<TProps, TId extends Id> extends AbstractEntity<TProps, TId> {}
