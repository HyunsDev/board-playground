import {
  BaseDomainEvent,
  BaseDomainEventProps,
  DrivenMessageMetadata,
} from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type IUserCreatedEvent = BaseDomainEventProps<{
  userId: string;
  email: string;
  username: string;
  nickname: string;
}>;

export class UserCreatedEvent extends BaseDomainEvent<IUserCreatedEvent> {
  static readonly code = defineEventCode('account:user:evt:created');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUserCreatedEvent['data'], metadata?: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}
