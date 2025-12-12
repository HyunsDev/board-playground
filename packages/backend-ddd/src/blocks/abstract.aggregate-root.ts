import { AbstractEntity } from './abstract.entity';

import { AbstractDomainEvent, AbstractIDomainEvent } from '@/cqrs/abstract.domain-event';

export abstract class AbstractAggregateRoot<
  TDomainEvent extends AbstractDomainEvent<
    string,
    string,
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AbstractIDomainEvent<string, any>
  >,
  TProps,
> extends AbstractEntity<TProps> {
  private _domainEvents: TDomainEvent[] = [];

  get domainEvents(): TDomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: TDomainEvent): void {
    this._domainEvents = [...this._domainEvents, domainEvent];
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public pullEvents(): TDomainEvent[] {
    const events = [...this._domainEvents];
    this.clearEvents();
    return events;
  }
}
