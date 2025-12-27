import { DomainResultAsync, StorePort } from '@workspace/backend-ddd';
import { EmailVerificationCode } from '@workspace/domain';

export abstract class EmailVerificationCodeStorePort extends StorePort {
  abstract generate(email: string, ttlSec: number): DomainResultAsync<EmailVerificationCode, never>;
  abstract verifyAndConsume(
    email: string,
    code: EmailVerificationCode,
  ): DomainResultAsync<boolean, never>;
}
