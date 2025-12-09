import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ApiErrors } from '@workspace/contract';

import { ContextService } from '@/infra/context/context.service';
import { DomainException } from '@/shared/base/error/base.domain-exception';
import { apiErr } from '@/shared/base/interface/response.utils';
import { matchPublicError } from '@/shared/utils/match-error.utils';

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
        AccessDenied: () => apiErr(ApiErrors.Common.AccessDenied),
        InvalidAccessToken: () => apiErr(ApiErrors.Auth.AccessTokenInvalid),
        ExpiredToken: () => apiErr(ApiErrors.Auth.AccessTokenExpired),
        MissingToken: () => apiErr(ApiErrors.Auth.AccessTokenMissing),
        InternalServerError: (err) => {
          this.logger.error(
            `[${requestId}] Internal server error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(ApiErrors.Common.InternalServerError, err.details);
        },
        UnexpectedDomainError: (err) => {
          this.logger.error(
            `[${requestId}] Unexpected domain error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(ApiErrors.Common.UnexpectedDomainError, {
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
      const response = apiErr(ApiErrors.Common.UnhandledDomainError, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
