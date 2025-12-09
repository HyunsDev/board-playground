import { createHmac, randomBytes } from 'crypto';

import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@workspace/contract';

import { TokenConfig, tokenConfig } from '@/infra/config/configs/token.config';

@Injectable()
export class TokenProvider {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(tokenConfig.KEY)
    private readonly tokenConfig: TokenConfig,
  ) {}

  generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

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
