import { createHash, randomBytes } from 'crypto';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@/shared/types/token-payload.type';

@Injectable()
export class TokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

  generateRefreshToken() {
    const refreshToken = randomBytes(64).toString('hex');
    const hashedRefreshToken = this.hashToken(refreshToken);
    return { refreshToken, hashedRefreshToken };
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  validateAccessToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      return null;
    }
  }
}
