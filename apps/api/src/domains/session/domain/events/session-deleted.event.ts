import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { UserId } from '@workspace/domain';
import { AggregateCodeEnum, asDomainEventCode, SessionId } from '@workspace/domain';

type ISessionDeletedEvent = BaseDomainEventProps<{
  userId: UserId;
  sessionId: SessionId;
  sessionName: string;
}>;
export class SessionDeletedEvent extends BaseDomainEvent<ISessionDeletedEvent> {
  readonly audit = true;
  static readonly code = asDomainEventCode('account:session:evt:deleted');
  readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionDeletedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
