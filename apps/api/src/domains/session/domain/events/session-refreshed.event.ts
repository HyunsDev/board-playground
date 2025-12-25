import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { asDomainEventCode, AggregateCodeEnum, SessionId, RefreshTokenId } from '@workspace/domain';

type ISessionRefreshedEvent = BaseDomainEventProps<{
  userId: UserId;
  sessionId: SessionId;
  newRefreshTokenId: RefreshTokenId;
}>;

export class SessionRefreshedEvent extends BaseDomainEvent<ISessionRefreshedEvent> {
  static readonly code = asDomainEventCode('account:session:evt:refreshed');
  readonly resourceType = AggregateCodeEnum.Account.Session;
  readonly audit = true;

  constructor(data: ISessionRefreshedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
