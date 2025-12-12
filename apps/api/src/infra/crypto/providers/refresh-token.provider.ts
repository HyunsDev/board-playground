import { createHmac, randomBytes } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { RefreshTokenConfig, refreshTokenConfig } from '@/core/configs/refresh-token.config';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    @Inject(refreshTokenConfig.KEY)
    private readonly tokenConfig: RefreshTokenConfig,
  ) {}

  generateRefreshToken() {
    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashRefreshToken(refreshToken);
    return { refreshToken, refreshTokenHash };
  }

  hashRefreshToken(refreshToken: string) {
    return createHmac('sha256', this.tokenConfig.refreshTokenSecret)
      .update(refreshToken)
      .digest('hex');
  }
}
