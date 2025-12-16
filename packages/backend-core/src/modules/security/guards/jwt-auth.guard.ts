/* eslint-disable @typescript-eslint/no-unsafe-argument */
// libs/common/src/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, Logger, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import {
  DomainException,
  ExpiredTokenError,
  InvalidAccessTokenError,
  MissingTokenError,
} from '@workspace/backend-ddd';
import { DomainCodeEnums, TokenPayload, TokenPayloadSchema } from '@workspace/domain';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

import { ContextService } from '@/modules/context';
import { systemLog, SystemLogActionEnum } from '@/modules/logging';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly reflector: Reflector,
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

  /**
   * handleRequest
   * @param err - 시스템 에러
   * @param payload - Strategy 검증 후 반환된 데이터 (Token Payload)
   * @param info - 검증 실패 시 에러 정보 (Error 객체 또는 메시지)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleRequest(err: any, payload: unknown, info: any): any {
    // 1. 에러가 있거나, 토큰 페이로드가 없는 경우 예외 처리
    if (err || !payload) {
      if (err) {
        throw err;
      }

      // 2. info 객체를 통한 구체적인 에러 원인 확인 (문자열 비교)
      const errorName = info?.name;
      const errorMessage = info?.message;

      if (errorName === 'TokenExpiredError') {
        throw new DomainException(new ExpiredTokenError());
      }

      if (errorName === 'JsonWebTokenError') {
        throw new DomainException(new InvalidAccessTokenError());
      }

      if (errorMessage === 'No auth token') {
        throw new DomainException(new MissingTokenError());
      }

      // 그 외 알 수 없는 인증 에러는 로그를 남기고 Unauthorized 처리
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.UnknownError, {
          msg: `Unknown authentication error: ${JSON.stringify(info)}`,
        }),
      );
      throw new InternalServerErrorException();
    }

    // 3. Payload 구조 검증 (Zod safeParse)
    // 변수명을 payload로 변경하여 의미를 명확히 함
    const parsedResult = TokenPayloadSchema.safeParse(payload);

    if (!parsedResult.success) {
      this.logger.warn(
        systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InvariantViolation, {
          msg: `Invalid Token Payload: ${JSON.stringify(parsedResult.error.issues)}`,
        }),
      );
      throw new DomainException(new InvalidAccessTokenError());
    }

    const validatedPayload: TokenPayload = parsedResult.data;

    // 4. ContextService에 토큰 정보 주입
    this.context.setToken({
      sub: validatedPayload.sub,
      email: validatedPayload.email,
      role: validatedPayload.role,
      sessionId: validatedPayload.sessionId,
    });

    // 5. 요청 객체(req.user)에 할당될 값 반환
    return validatedPayload;
  }
}
