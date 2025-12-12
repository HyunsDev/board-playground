import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { TokenPayload } from '@workspace/domain';

@Injectable()
export class AccessTokenProvider {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload) {
    return this.jwtService.sign(payload);
  }

  verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
