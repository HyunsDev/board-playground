import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

import { BaseDomainEvent, BaseIDomainEvent } from '@/shared/base';

type ISessionDeletedEvent = BaseIDomainEvent<{
  userId: string;
  sessionId: string;
  sessionName: string;
}>;
export class SessionDeletedEvent extends BaseDomainEvent<ISessionDeletedEvent> {
  public readonly code = defineEventCode('account:session:evt:deleted');
  public readonly resourceType = AggregateCodeEnum.Account.Session;

  constructor(data: ISessionDeletedEvent['data'], metadata?: ISessionDeletedEvent['metadata']) {
    super(data.sessionId, data, metadata);
  }
}
