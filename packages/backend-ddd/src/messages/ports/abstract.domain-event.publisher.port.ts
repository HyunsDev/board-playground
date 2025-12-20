import { AbstractDomainEvent, AbstractDomainEventProps } from '../messages/abstract.domain-event';

export abstract class AbstractDomainEventPublisherPort {
  abstract publish(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: AbstractDomainEvent<string, string, string, AbstractDomainEventProps<any>>,
  ): Promise<void>;
  abstract publishMany(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    events: AbstractDomainEvent<string, string, string, AbstractDomainEventProps<any>>[],
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
