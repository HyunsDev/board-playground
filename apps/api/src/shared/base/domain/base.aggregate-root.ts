import { BaseDomainEvent } from './base.domain-event';
import { Entity } from './base.entity';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
  private _domainEvents: BaseDomainEvent[] = [];

  get domainEvents(): BaseDomainEvent[] {
    return this._domainEvents;
  }

  protected addEvent(domainEvent: BaseDomainEvent): void {
    this._domainEvents = [...this._domainEvents, domainEvent];
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public pullEvents(): BaseDomainEvent[] {
    const events = [...this._domainEvents];
    this.clearEvents();
    return events;
  }
}
