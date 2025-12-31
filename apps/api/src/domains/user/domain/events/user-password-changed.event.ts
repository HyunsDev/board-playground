import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { UserEmail, UserId } from '@workspace/domain';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

type UserPasswordChangedEventProps = BaseDomainEventProps<{
  userId: UserId;
  userEmail: UserEmail;
}>;

export class UserPasswordChangedEvent extends BaseDomainEvent<UserPasswordChangedEventProps> {
  static readonly code = asDomainEventCode('account:user:evt:password_changed');
  readonly resourceType = AggregateCodeEnum.Account.User;
  readonly audit = true;

  constructor(data: UserPasswordChangedEventProps['data']) {
    super(data.userId, data);
  }
}
