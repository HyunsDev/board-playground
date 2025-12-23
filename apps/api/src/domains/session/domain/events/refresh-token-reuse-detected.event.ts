import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type IRefreshTokenReuseDetectedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
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
