import { AbstractDomainEvent } from './abstract.domain-event';

export abstract class DomainEventPublisherPort {
  abstract publish(event: AbstractDomainEvent): Promise<void>;
  abstract publishMany(events: AbstractDomainEvent[]): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
