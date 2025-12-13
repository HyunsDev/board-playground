import { BaseDomainEvent, BaseDomainEventProps, DeriveMetadata } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type ISessionCreatedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionCreatedEvent extends BaseDomainEvent<ISessionCreatedEvent> {
  public static readonly code = defineEventCode('account:session:evt:created');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionCreatedEvent['data'], metadata?: DeriveMetadata) {
    super(data.sessionId, data, metadata);
  }
}
