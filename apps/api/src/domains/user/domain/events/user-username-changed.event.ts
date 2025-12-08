import { IDomainEvent, BaseDomainEvent } from '@/shared/base';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';

export type IUserNameChangedEvent = IDomainEvent<{
  userId: string;
  oldUsername: string;
  newUsername: string;
}>;

export class UserUsernameChangedEvent extends BaseDomainEvent<IUserNameChangedEvent> {
  public readonly domain = DomainCodes.User;
  readonly code = DomainEventCodes.User.UsernameChanged;
  readonly resourceType = DomainCodes.User;

  constructor(data: IUserNameChangedEvent['data'], metadata?: IUserNameChangedEvent['metadata']) {
    super(data.userId, data, metadata);
  }
}
