import { AbstractIntegrationEvent, AbstractIntegrationEventProps } from '../messages';

export abstract class IntegrationEventPublisherPort {
  abstract publish(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: AbstractIntegrationEvent<string, string, string, AbstractIntegrationEventProps<any>>,
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
