// libs/common/src/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  ExpiredTokenException,
  InvalidTokenException,
  MissingTokenException,
} from '../domain/secruity.exceptions';

import { ContextService } from '@/infra/context/context.service';
import { UnauthorizedException } from '@/shared/base';
import { TokenPayload, tokenPayloadSchema } from '@/shared/types/token-payload.type';

const parseTokenPayload = (payload: unknown): TokenPayload => {
  const parsed = tokenPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    throw new InvalidTokenException();
  }
  return parsed.data;
};

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly context: ContextService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  // 예외 처리 커스터마이징 (선택 사항)
  handleRequest(err: any, token: any, info: any) {
    if (err || !token) {
      // 2. 구체적인 에러 원인 확인 (info)
      if (info?.name === 'TokenExpiredError') {
        throw new ExpiredTokenException();
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new InvalidTokenException();
      }

      if (info?.message === 'No auth token') {
        throw new MissingTokenException();
      }
      // 그 외 알 수 없는 인증 에러
      throw err || new UnauthorizedException();
    }

    const parsedToken = parseTokenPayload(token);
    this.context.setToken({
      id: parsedToken.sub,
      email: parsedToken.email,
      role: parsedToken.role,
      deviceId: parsedToken.deviceId,
    });

    return token;
  }
}
