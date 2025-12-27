import crypto from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';

import { BaseStringStore, redisConfig, RedisConfig, RedisService } from '@workspace/backend-core';
import { asStoreCode, PasswordResetCode } from '@workspace/domain';

import { PasswordResetCodeStorePort } from '../domain/password-reset-code.store.port';

@Injectable()
export class PasswordResetCodeStore
  extends BaseStringStore<PasswordResetCode>
  implements PasswordResetCodeStorePort
{
  constructor(
    readonly redis: RedisService,
    @Inject(redisConfig.KEY) private readonly config: RedisConfig,
  ) {
    super(redis, asStoreCode('account:auth:sto:password_reset_code'));
  }

  generate(email: string, ttlSec: number) {
    const code = this.generateRandomCode();
    const id = this.emailToId(email);
    return this.client.set(id, code, ttlSec).map(() => code);
  }

  verifyAndConsume(email: string, code: PasswordResetCode) {
    const id = this.emailToId(email);
    return this.client.verifyAndConsume(id, code);
  }

  private emailToId(email: string): string {
    return crypto
      .createHmac('sha256', this.config.redisKeyHashSecret)
      .update(email.toLowerCase().trim())
      .digest('hex');
  }

  private generateRandomCode(): PasswordResetCode {
    return v4() as PasswordResetCode;
  }
}
