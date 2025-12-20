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
  public static readonly code = asDomainEventCode('account:session:evt:created');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionCreatedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.sessionId, data, metadata);
  }
}
