import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { UserEmail, UserId, Username } from '@workspace/domain';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type IUserCreatedEvent = BaseDomainEventProps<{
  userId: UserId;
  email: UserEmail;
  username: Username;
  nickname: string;
}>;

export class UserCreatedEvent extends BaseDomainEvent<IUserCreatedEvent> {
  static readonly code = asDomainEventCode('account:user:evt:created');
  readonly resourceType = AggregateCodeEnum.Account.User;
  readonly audit = true;

  constructor(data: IUserCreatedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}
