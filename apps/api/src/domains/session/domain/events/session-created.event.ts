import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type ISessionCreatedEvent = BaseDomainEventProps<{
  userId: string;
  sessionId: string;
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
