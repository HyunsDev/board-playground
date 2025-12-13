import { BaseDomainEvent, BaseDomainEventProps, DeriveMetadata } from '@workspace/backend-core';
import { AggregateCodeEnum, defineEventCode } from '@workspace/domain';

type IUserNameChangedEvent = BaseDomainEventProps<{
  userId: string;
  oldUsername: string;
  newUsername: string;
}>;

export class UserUsernameChangedEvent extends BaseDomainEvent<IUserNameChangedEvent> {
  static readonly code = defineEventCode('account:user:evt:username_changed');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUserNameChangedEvent['data'], metadata?: DeriveMetadata) {
    super(data.userId, data, metadata);
  }
}
