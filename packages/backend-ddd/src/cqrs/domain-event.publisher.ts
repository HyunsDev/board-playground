import { AbstractDomainEvent } from './abstract.domain-event';

export interface DomainEventPublisher {
  publish(event: AbstractDomainEvent<any, any, any>): Promise<void>;
  publishMany(events: AbstractDomainEvent<any, any, any>[]): Promise<void>;
  clear(): void;
  flush(): Promise<void>;
}
