import { AbstractPub, AbstractPubProps } from '../messages';

export abstract class IntegrationEventPublisherPort {
  abstract publish(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: AbstractPub<string, string, string, AbstractPubProps<any>>,
  ): Promise<void>;
  abstract clear(): void;
  abstract flush(): Promise<void>;
}
