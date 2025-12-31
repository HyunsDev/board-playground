import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { UserId } from '@workspace/domain';
import { AggregateCodeEnum, asDomainEventCode, SessionId } from '@workspace/domain';

type ISessionCreatedEvent = BaseDomainEventProps<{
  userId: UserId;
  sessionId: SessionId;
  sessionName: string;
}>;
export class SessionCreatedEvent extends BaseDomainEvent<ISessionCreatedEvent> {
  static readonly code = asDomainEventCode('account:session:evt:created');
  readonly resourceType = AggregateCodeEnum.Account.Session;
  readonly audit = true;

  constructor(data: ISessionCreatedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
