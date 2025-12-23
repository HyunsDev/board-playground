import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { asDomainEventCode, AggregateCodeEnum } from '@workspace/domain';

type ISessionRefreshedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
  newRefreshTokenId: string;
}>;

export class SessionRefreshedEvent extends BaseDomainEvent<ISessionRefreshedEvent> {
  static readonly code = asDomainEventCode('account:session:evt:refreshed');
  readonly resourceType = AggregateCodeEnum.Account.Session;
  readonly audit = true;

  constructor(data: ISessionRefreshedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
