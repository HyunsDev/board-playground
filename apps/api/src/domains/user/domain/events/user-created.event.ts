import { BaseDomainEvent, IDomainEvent } from '@/shared/base';
import { DomainEventCodes } from '@/shared/codes/domain-event.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';

export type IUserCreatedEvent = IDomainEvent<{
  userId: string;
  email: string;
  username: string;
  nickname: string;
}>;

export class UserCreatedEvent extends BaseDomainEvent<IUserCreatedEvent> {
  readonly code = DomainEventCodes.User.Created;
  readonly resourceType = DomainCodes.User;

  constructor(data: IUserCreatedEvent['data'], metadata?: IUserCreatedEvent['metadata']) {
    super(data.userId, data, metadata);
  }
}
