import { AbstractIntegrationEventProps, AbstractIntegrationEvent } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, IntegrationEventCode } from '@workspace/domain';

export type BaseIntegrationEventProps<T> = AbstractIntegrationEventProps<T>;

export abstract class BaseIntegrationEvent<
  TProps extends BaseIntegrationEventProps<unknown>,
> extends AbstractIntegrationEvent<CausationCode, DomainCode, IntegrationEventCode, TProps> {
  static readonly code: IntegrationEventCode;
}
