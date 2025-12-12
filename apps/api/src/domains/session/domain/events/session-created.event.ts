import { BaseDomainEvent, IDomainEvent } from '@/shared/base';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';

export type ISessionCreatedEvent = IDomainEvent<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionCreatedEvent extends BaseDomainEvent<ISessionCreatedEvent> {
  public readonly code = DomainEventCodes.Session.Created;
  public readonly resourceType = ResourceTypes.Session;

  constructor(data: ISessionCreatedEvent['data'], metadata?: ISessionCreatedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
