import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { TokenPayload } from '@workspace/domain';

import { HttpConfig, httpConfig } from '@/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(httpConfig.KEY)
    readonly httpConfig: HttpConfig,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: httpConfig.jwtAccessSecret,
    });
  }

  async validate(payload: TokenPayload) {
    return payload;
  }
}
