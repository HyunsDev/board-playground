import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { AggregateCodeEnum, asDomainEventCode } from '@workspace/domain';

export class UserPasswordChangedEvent extends BaseDomainEvent<
  BaseDomainEventProps<{
    userId: string;
    userEmail: string;
  }>
> {
  static readonly code = asDomainEventCode('account:user:evt:password_changed');
  readonly resourceType = AggregateCodeEnum.Account.User;
  readonly audit = true;

  constructor(data: { userId: string; userEmail: string }) {
    super(data.userId, data);
  }
}
