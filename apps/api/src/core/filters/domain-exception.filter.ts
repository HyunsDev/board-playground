import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { EXCEPTION } from '@workspace/contract';

import { ContextService } from '@/infra/context/context.service';
import {
  AccessDeniedError,
  ExpiredTokenError,
  InternalServerError,
  InvalidAccessTokenError,
  MissingTokenError,
  UnexpectedDomainError,
} from '@/shared/base';
import { DomainException } from '@/shared/base/error/base.domain-exception';
import { EnsurePublic } from '@/shared/base/interface/api-error.types';
import { apiErr } from '@/shared/base/interface/response.utils';
import { matchPublicError } from '@/shared/utils/match-error.utils';

export type GlobalDomainError = EnsurePublic<
  | AccessDeniedError
  | InternalServerError
  | UnexpectedDomainError
  | InvalidAccessTokenError
  | ExpiredTokenError
  | MissingTokenError
>;

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  private readonly logger = new Logger(DomainExceptionFilter.name);
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly context: ContextService,
  ) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const requestId = this.context.getRequestId() || 'unknown';

    const error = exception?.error;
    try {
      const response = matchPublicError(error, {
        AccessDenied: () => apiErr(EXCEPTION.COMMON.ACCESS_DENIED),
        InvalidAccessToken: () => apiErr(EXCEPTION.AUTH.ACCESS_TOKEN_INVALID),
        ExpiredToken: () => apiErr(EXCEPTION.AUTH.ACCESS_TOKEN_EXPIRED),
        MissingToken: () => apiErr(EXCEPTION.AUTH.ACCESS_TOKEN_MISSING),
        InternalServerError: (err) => {
          this.logger.error(
            `[${requestId}] Internal server error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(EXCEPTION.COMMON.INTERNAL_SERVER_ERROR, err.details);
        },
        UnexpectedDomainError: (err) => {
          this.logger.error(
            `[${requestId}] Unexpected domain error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(EXCEPTION.COMMON.UNEXPECTED_DOMAIN_ERROR, {
            originalErrorName: err.details?.error?.code,
          });
        },
      });

      // 4. 응답 전송
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    } catch {
      this.logger.error(
        `[${requestId}] Unhandled domain error: ${error.details?.error?.code}`,
        exception?.stack,
        JSON.stringify(error.details?.error),
      );
      const response = apiErr(EXCEPTION.COMMON.UNHANDLED_DOMAIN_ERROR, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
