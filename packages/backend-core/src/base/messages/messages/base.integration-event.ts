import { AbstractIntegrationEventProps, AbstractIntegrationEvent } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, IntegrationEventCode, ModelId } from '@workspace/domain';

import { DrivenMessageMetadata } from '../message-metadata';

export type BaseIntegrationEventProps<T> = AbstractIntegrationEventProps<T>;

export abstract class BaseIntegrationEvent<
  TProps extends BaseIntegrationEventProps<unknown>,
> extends AbstractIntegrationEvent<CausationCode, DomainCode, IntegrationEventCode, TProps> {
  static readonly code: IntegrationEventCode;

  constructor(resourceId: ModelId | null, data: TProps['data'], metadata?: DrivenMessageMetadata) {
    super(resourceId, data, metadata);
  }
}
