import { BaseDomainEvent, BaseIDomainEvent } from '@workspace/backend-core';
import { defineEventCode, AggregateCodeEnum } from '@workspace/domain';

type ISessionRefreshedEvent = BaseIDomainEvent<{
  userId: string;
  sessionId: string;
  newRefreshTokenId: string;
}>;

export class SessionRefreshedEvent extends BaseDomainEvent<ISessionRefreshedEvent> {
  public readonly code = defineEventCode('account:session:evt:refreshed');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionRefreshedEvent['data'], metadata?: ISessionRefreshedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
