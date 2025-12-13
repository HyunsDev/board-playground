import { BaseDomainEvent, BaseIDomainEvent } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type IRefreshTokenReuseDetectedEvent = BaseIDomainEvent<{
  userId: string;
  sessionId: string;
  reusedTokenId: string;
}>;
export class RefreshTokenReuseDetectedEvent extends BaseDomainEvent<IRefreshTokenReuseDetectedEvent> {
  public readonly code = defineEventCode('account:session:evt:refresh_token_reuse_detected');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(
    data: IRefreshTokenReuseDetectedEvent['data'],
    metadata?: IRefreshTokenReuseDetectedEvent['metadata'],
  ) {
    super(data.sessionId, data, metadata);
  }
}
