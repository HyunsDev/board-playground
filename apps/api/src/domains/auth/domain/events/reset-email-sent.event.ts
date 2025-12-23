import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { asDomainEventCode, DomainCodeEnums } from '@workspace/domain';

type ResetEmailSentEventProps = BaseDomainEventProps<{
  email: string;
}>;

export class ResetEmailSentEvent extends BaseDomainEvent<ResetEmailSentEventProps> {
  static readonly code = asDomainEventCode('account:auth:evt:reset_email_sent');
  readonly resourceType = DomainCodeEnums.Account.Auth;
  readonly audit = true;

  constructor(data: ResetEmailSentEventProps['data']) {
    super(null, data);
  }
}
