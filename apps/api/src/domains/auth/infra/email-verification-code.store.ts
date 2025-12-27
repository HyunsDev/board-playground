import crypto from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { BaseStringStore, RedisConfig, redisConfig, RedisService } from '@workspace/backend-core';
import { asStoreCode, EmailVerificationCode } from '@workspace/domain';

import { EmailVerificationCodeStorePort } from '../domain/email-verification-code.store.port';

@Injectable()
export class EmailVerificationCodeStore
  extends BaseStringStore<EmailVerificationCode>
  implements EmailVerificationCodeStorePort
{
  constructor(
    readonly redis: RedisService,
    @Inject(redisConfig.KEY) private readonly config: RedisConfig,
  ) {
    super(redis, asStoreCode('account:auth:sto:email_verification_code'));
  }

  generate(email: string, ttlSec: number) {
    const code = this.generateRandomCode();
    const id = this.emailToId(email);
    return this.client.set(id, code, ttlSec).map(() => code);
  }

  verifyAndConsume(email: string, code: EmailVerificationCode) {
    const id = this.emailToId(email);
    return this.client.verifyAndConsume(id, code);
  }

  private emailToId(email: string): string {
    return crypto
      .createHmac('sha256', this.config.redisKeyHashSecret)
      .update(email.toLowerCase().trim())
      .digest('hex');
  }

  private generateRandomCode(): EmailVerificationCode {
    return crypto.randomInt(100000, 1000000).toString() as EmailVerificationCode;
  }
}
