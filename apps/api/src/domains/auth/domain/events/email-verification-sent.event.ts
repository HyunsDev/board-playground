import { BaseDomainEvent, BaseDomainEventProps } from '@workspace/backend-core';
import { asDomainEventCode, DomainCodeEnums } from '@workspace/domain';

type emailVerificationSentEventProps = BaseDomainEventProps<{
  email: string;
}>;

export class EmailVerificationSentEvent extends BaseDomainEvent<emailVerificationSentEventProps> {
  static readonly code = asDomainEventCode('account:auth:evt:email_verification_sent');
  readonly resourceType = DomainCodeEnums.Account.Auth;
  readonly audit = true;

  constructor(data: emailVerificationSentEventProps['data']) {
    super(null, data);
  }
}
