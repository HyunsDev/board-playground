import { BaseDomainEvent, IDomainEvent } from '@/shared/base';
import { AggregateCodes } from '@/shared/codes/aggregate.codes';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';

export type ISessionDeletedEvent = IDomainEvent<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionDeletedEvent extends BaseDomainEvent<ISessionDeletedEvent> {
  public readonly domain = DomainCodes.Session;
  public readonly code = DomainEventCodes.Session.Deleted;
  public readonly resourceType = AggregateCodes.Session;

  constructor(data: ISessionDeletedEvent['data'], metadata?: ISessionDeletedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
