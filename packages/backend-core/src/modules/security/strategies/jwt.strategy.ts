import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '@workspace/domain';

import { AccessTokenConfig, accessTokenConfig } from '@/modules/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(accessTokenConfig.KEY)
    readonly accessTokenConfig: AccessTokenConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenConfig.jwtAccessSecret,
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}
