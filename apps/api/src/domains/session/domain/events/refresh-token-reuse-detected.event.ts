import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { AggregateCodeEnum, asDomainEventCode, SessionId } from '@workspace/domain';

type IRefreshTokenReuseDetectedEvent = BaseDomainEventProps<{
  userId: UserId;
  sessionId: SessionId;
  reusedTokenId: string;
}>;
export class RefreshTokenReuseDetectedEvent extends BaseDomainEvent<IRefreshTokenReuseDetectedEvent> {
  static readonly code = asDomainEventCode('account:session:evt:refresh_token_reuse_detected');
  readonly resourceType = AggregateCodeEnum.Account.Session;
  readonly audit = true;

  constructor(data: IRefreshTokenReuseDetectedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
