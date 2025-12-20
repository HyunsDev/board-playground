import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type ISessionDeletedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionDeletedEvent extends BaseDomainEvent<ISessionDeletedEvent> {
  public static readonly code = asDomainEventCode('account:session:evt:deleted');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionDeletedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
