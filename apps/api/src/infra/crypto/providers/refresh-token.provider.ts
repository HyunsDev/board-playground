import { createHmac, randomBytes } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';

import { TokenConfig, tokenConfig } from '@/infra/config/configs/token.config';

@Injectable()
export class RefreshTokenProvider {
  constructor(
    @Inject(tokenConfig.KEY)
    private readonly tokenConfig: TokenConfig,
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
