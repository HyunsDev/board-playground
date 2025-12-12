import { AbstractEntity } from './abstract.entity';

import { AbstractDomainEvent, AbstractIDomainEvent } from '@/cqrs/abstract.domain-event';

export abstract class AbstractAggregateRoot<
  DomainEvent extends AbstractDomainEvent<
    string,
    string,
    string,
    AbstractIDomainEvent<string, any>
  >,
  TProps,
> extends AbstractEntity<TProps> {
  private _domainEvents: DomainEvent[] = [];

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents = [...this._domainEvents, domainEvent];
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public pullEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this.clearEvents();
    return events;
  }
}
