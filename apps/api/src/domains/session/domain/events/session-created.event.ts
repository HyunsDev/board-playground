import { BaseDomainEvent, BaseIDomainEvent } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type ISessionCreatedEvent = BaseIDomainEvent<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionCreatedEvent extends BaseDomainEvent<ISessionCreatedEvent> {
  public readonly code = defineEventCode('account:session:evt:created');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionCreatedEvent['data'], metadata?: ISessionCreatedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
