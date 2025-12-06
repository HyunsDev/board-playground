import { createHmac, randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@workspace/contract';

import { EnvSchema } from '@/core/config/env.validation';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvSchema>,
  ) {}

  generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken() {
    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = this.hashToken(refreshToken);
    return { refreshToken, refreshTokenHash };
  }

  hashToken(token: string) {
    return createHmac('sha256', this.configService.get('REFRESH_TOKEN_SECRET'))
      .update(token)
      .digest('hex');
  }

  validateAccessToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
