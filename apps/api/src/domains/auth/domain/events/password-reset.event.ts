import { BaseDomainEventProps, BaseDomainEvent } from '@workspace/backend-core';
import { UserId } from '@workspace/common';
import { asDomainEventCode, DomainCodeEnums } from '@workspace/domain';

type EmailResetEventProps = BaseDomainEventProps<{
  userId: UserId;
}>;

export class PasswordResetEvent extends BaseDomainEvent<EmailResetEventProps> {
  static readonly code = asDomainEventCode('account:auth:evt:password_reset');
  readonly resourceType = DomainCodeEnums.Account.Auth;
  readonly audit = true;

  constructor(data: EmailResetEventProps['data']) {
    super(data.userId, data);
  }
}
