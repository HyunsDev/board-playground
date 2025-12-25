import { BrandId } from '@workspace/common';

import { AbstractEntity } from './abstract.entity';

import { AbstractDomainEvent } from '@/messages';

export abstract class AbstractAggregateRoot<
  TProps,
  TId extends BrandId,
  TDomainEvent extends AbstractDomainEvent,
> extends AbstractEntity<TProps, TId> {
  private _domainEvents: TDomainEvent[] = [];

  get domainEvents(): TDomainEvent[] {
    return this._domainEvents;
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
}
