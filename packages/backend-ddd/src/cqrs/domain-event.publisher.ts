import { AbstractDomainEvent } from './abstract.domain-event';

export abstract class DomainEventPublisher {
  abstract publish(event: AbstractDomainEvent<any, any, any>): Promise<void>;
  abstract publishMany(events: AbstractDomainEvent<any, any, any>[]): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
