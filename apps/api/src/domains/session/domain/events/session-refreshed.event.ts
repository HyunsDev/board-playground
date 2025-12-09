import { IDomainEvent, BaseDomainEvent } from '@/shared/base';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';

export type ISessionRefreshedEvent = IDomainEvent<{
  userId: string;
  sessionId: string;
  newRefreshTokenId: string;
}>;

export class SessionRefreshedEvent extends BaseDomainEvent<ISessionRefreshedEvent> {
  public readonly domain = DomainCodes.Session;
  public readonly code = DomainEventCodes.Session.Refreshed;
  public readonly resourceType = ResourceTypes.Session;

  constructor(data: ISessionRefreshedEvent['data'], metadata?: ISessionRefreshedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
