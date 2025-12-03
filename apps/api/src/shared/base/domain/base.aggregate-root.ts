import { DomainEvent } from './base.domain-event';
import { Entity } from './base.entity';

export abstract class AggregateRoot<EntityProps> extends Entity<EntityProps> {
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
