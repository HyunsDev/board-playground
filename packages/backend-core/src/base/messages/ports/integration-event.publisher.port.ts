import {
  BaseIntegrationEvent,
  BaseIntegrationEventProps,
} from '../messages/base.integration-event';

export abstract class IntegrationEventPublisherPort {
  abstract publish(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: BaseIntegrationEvent<BaseIntegrationEventProps<any>>,
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
