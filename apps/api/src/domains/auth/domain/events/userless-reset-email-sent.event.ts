import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { asDomainEventCode, DomainCodeEnums } from '@workspace/domain';

type UserLessResetEmailSentEventProps = BaseDomainEventProps<{
  email: string;
}>;

export class UserLessResetEmailSentEvent extends BaseDomainEvent<UserLessResetEmailSentEventProps> {
  static readonly code = asDomainEventCode('account:auth:evt:userless_reset_email_sent');
  readonly resourceType = DomainCodeEnums.Account.Auth;
  readonly audit = true;

  constructor(data: UserLessResetEmailSentEventProps['data']) {
    super(null, data);
  }
}
