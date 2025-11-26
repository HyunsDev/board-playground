// libs/common/src/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { EXCEPTION } from '@workspace/contract';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

import { TokenPayload } from '@/common/types';
import { ClsAccessor } from '@/libs/cls';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
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
        throw new UnauthorizedException({
          code: EXCEPTION.AUTH.EXPIRED_TOKEN.code,
          message: EXCEPTION.AUTH.EXPIRED_TOKEN.message,
        });
      }

      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          code: EXCEPTION.AUTH.INVALID_TOKEN.code,
          message: EXCEPTION.AUTH.INVALID_TOKEN.message,
        });
      }

      if (info?.message === 'No auth token') {
        throw new UnauthorizedException({
          code: EXCEPTION.AUTH.MISSING_TOKEN.code,
          message: EXCEPTION.AUTH.MISSING_TOKEN.message,
        });
      }

      // 그 외 알 수 없는 인증 에러
      throw err || new UnauthorizedException();
    }

    ClsAccessor.setToken(token as TokenPayload);

    return token;
  }
}
