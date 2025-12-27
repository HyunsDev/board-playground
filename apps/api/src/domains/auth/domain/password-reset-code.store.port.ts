import { DomainResultAsync, StorePort } from '@workspace/backend-ddd';
import { PasswordResetCode } from '@workspace/domain';

export abstract class PasswordResetCodeStorePort extends StorePort {
  abstract generate(email: string, ttlSec: number): DomainResultAsync<PasswordResetCode, never>;
  abstract verifyAndConsume(
    email: string,
    code: PasswordResetCode,
  ): DomainResultAsync<boolean, never>;
}
