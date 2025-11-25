import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

import { TokenPayload } from '@/common/types';
import { Tokens } from '@/common/types/tokens';

const { JWT_ACCESS_SECRET, JWT_ACCESS_EXPIRATION, JWT_REFRESH_SECRET, JWT_REFRESH_EXPIRATION } =
  process.env;

@Injectable()
export class TokenService {
  constructor(private jwtService: JwtService) {}

  async generateTokens(userId: string, email: string, deviceIdentifier: string): Promise<Tokens> {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync<TokenPayload>(
        { sub: userId, email, deviceIdentifier, tokenType: 'access' },
        {
          secret: JWT_ACCESS_SECRET,
          expiresIn: JWT_ACCESS_EXPIRATION,
        } as JwtSignOptions,
      ),
      this.jwtService.signAsync<TokenPayload>(
        { sub: userId, email, deviceIdentifier, tokenType: 'refresh' },
        {
          secret: JWT_REFRESH_SECRET,
          expiresIn: JWT_REFRESH_EXPIRATION,
        } as JwtSignOptions,
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  validateToken(token: string, type: 'access' | 'refresh') {
    try {
      const secret = type === 'access' ? JWT_ACCESS_SECRET : JWT_REFRESH_SECRET;
      return this.jwtService.verify(token, { secret });
    } catch {
      return null;
    }
  }
}
