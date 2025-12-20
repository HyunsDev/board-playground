import { BaseDomainEvent, BaseDomainEventProps } from '../base.domain-event';

export abstract class DomainEventPublisherPort {
  abstract publish(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: BaseDomainEvent<BaseDomainEventProps<any>>,
  ): Promise<void>;
  abstract publishMany(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: BaseDomainEvent<BaseDomainEventProps<any>>[],
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
