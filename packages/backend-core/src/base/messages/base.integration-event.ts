import { AbstractIntegrationEventProps, AbstractIntegrationEvent } from '@workspace/backend-ddd';
import { IntegrationEventCode, Id } from '@workspace/domain';

import { DrivenMessageMetadata } from './message-metadata';
import { BaseMessageGenerics } from './message.types';

export type BaseIntegrationEventProps<T> = AbstractIntegrationEventProps<T>;

export abstract class BaseIntegrationEvent<
  TProps extends BaseIntegrationEventProps<unknown>,
> extends AbstractIntegrationEvent<BaseMessageGenerics<IntegrationEventCode>, TProps> {
  static readonly code: IntegrationEventCode;

  constructor(resourceId: Id | null, data: TProps['data'], metadata?: DrivenMessageMetadata) {
    super(resourceId, data, metadata);
  }
}
