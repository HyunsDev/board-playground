import { BaseDomainEvent, IDomainEvent } from '@/shared/base';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';

export type IRefreshTokenReuseDetectedEvent = IDomainEvent<{
  userId: string;
  sessionId: string;
  reusedTokenId: string;
}>;
export class RefreshTokenReuseDetectedEvent extends BaseDomainEvent<IRefreshTokenReuseDetectedEvent> {
  public readonly domain = DomainCodes.Session;
  public readonly code = DomainEventCodes.Session.RefreshTokenReuseDetected;
  public readonly resourceType = DomainCodes.Session;

  constructor(
    data: IRefreshTokenReuseDetectedEvent['data'],
    metadata?: IRefreshTokenReuseDetectedEvent['metadata'],
  ) {
    super(data.sessionId, data, metadata);
  }
}
