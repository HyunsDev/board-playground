import { BrandId } from '@workspace/common';

import { AbstractCreateEntityProps, AbstractEntity } from './abstract.entity';

import { DomainResult, DomainError } from '@/error';
import { AbstractDomainEvent } from '@/messages';

export const AggregateStatusSymbol = Symbol('AggregateStatusSymbol');

export const AggregateStatusEnum = {
  Normal: 'NORMAL',
  Deleted: 'DELETED',
} as const;
export type AggregateStatusEnum = typeof AggregateStatusEnum;
export type AggregateStatus = AggregateStatusEnum[keyof AggregateStatusEnum];

export type AggregateWithStatus<
  TAggregateRoot,
  TStatus extends AggregateStatus,
> = TAggregateRoot & {
  [AggregateStatusSymbol]: TStatus;
};

export type DeletedAggregate<TAggregateRoot> = AggregateWithStatus<
  TAggregateRoot,
  AggregateStatusEnum['Deleted']
>;

export abstract class AbstractAggregateRoot<
  TProps,
  TId extends BrandId,
  TDomainEvent extends AbstractDomainEvent,
> extends AbstractEntity<TProps, TId> {
  [AggregateStatusSymbol]: AggregateStatus = AggregateStatusEnum.Normal;
  private _domainEvents: TDomainEvent[] = [];

  protected constructor(props: AbstractCreateEntityProps<TProps, TId>) {
    super(props);
  }

  get domainEvents(): TDomainEvent[] {
    return [...this._domainEvents];
  }

  protected addEvent(domainEvent: TDomainEvent): void {
    this._domainEvents = [...this._domainEvents, domainEvent];
  }

  clearEvents(): void {
    this._domainEvents = [];
  }

  pullEvents(): TDomainEvent[] {
    const events = [...this._domainEvents];
    this.clearEvents();
    return events;
  }

  abstract delete(): DomainResult<DeletedAggregate<this>, DomainError>;

  protected toDeleted() {
    this[AggregateStatusSymbol] = AggregateStatusEnum.Deleted;
    return this as DeletedAggregate<this>;
  }

  static reconstruct<
    TProps,
    TId extends BrandId,
    TDomainEvent extends AbstractDomainEvent,
    TAggregate extends AbstractAggregateRoot<TProps, TId, TDomainEvent>,
  >(this: { prototype: TAggregate }, props: TProps): TAggregate {
    const ctor = this as unknown as new (props: TProps) => TAggregate;
    const instance = new ctor(props);
    return instance;
  }
}
