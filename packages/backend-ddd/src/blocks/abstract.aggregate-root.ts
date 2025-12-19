import { AbstractEntity } from './abstract.entity';

import { AbstractDomainEvent } from '@/messages/abstract.domain-event';

export abstract class AbstractAggregateRoot<
  TDomainEvent extends AbstractDomainEvent,
  TProps,
> extends AbstractEntity<TProps> {
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
