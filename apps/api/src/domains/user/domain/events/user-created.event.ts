import { BaseDomainEvent, BaseIDomainEvent } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type IUserCreatedEvent = BaseIDomainEvent<{
  userId: string;
  email: string;
  username: string;
  nickname: string;
}>;

export class UserCreatedEvent extends BaseDomainEvent<IUserCreatedEvent> {
  readonly code = defineEventCode('account:user:evt:created');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUserCreatedEvent['data'], metadata?: IUserCreatedEvent['metadata']) {
    super(data.userId, data, metadata);
  }
}
