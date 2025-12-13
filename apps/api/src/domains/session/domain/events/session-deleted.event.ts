import { BaseDomainEvent, BaseDomainEventProps, DeriveMetadata } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type ISessionDeletedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionDeletedEvent extends BaseDomainEvent<ISessionDeletedEvent> {
  public static readonly code = defineEventCode('account:session:evt:deleted');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionDeletedEvent['data'], metadata?: DeriveMetadata) {
    super(data.sessionId, data, metadata);
  }
}
