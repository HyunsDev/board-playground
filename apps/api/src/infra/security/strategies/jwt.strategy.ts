import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '@workspace/contract';

import { TokenConfig, tokenConfig } from '@/infra/config/configs/token.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(tokenConfig.KEY)
    readonly tokenConfig: TokenConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: tokenConfig.jwtAccessSecret,
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}
