import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ApiErrors } from '@workspace/contract';

import { GlobalSystemException, SystemException } from '@/shared/base';
import { apiErr } from '@/shared/base/interface/response.utils';
import { matchError } from '@/shared/utils/match-error.utils';

@Catch(SystemException)
export class SystemExceptionFilter implements ExceptionFilter<SystemException> {
  private readonly logger = new Logger(SystemExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: GlobalSystemException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    try {
      const response = matchError(exception, {
        InternalServerError: (err) => {
          this.logger.error(
            `Internal server error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(ApiErrors.Common.InternalServerError);
        },
        UnexpectedDomainError: (err) => {
          this.logger.error(
            `Unexpected domain error: ${err.details?.error?.code}`,
            exception?.stack,
            JSON.stringify(err.details?.error),
          );
          return apiErr(ApiErrors.Common.UnexpectedDomainError);
        },
        InvariantViolation: (err) => {
          this.logger.error(`Invariant violation: ${err.message}`, exception?.stack);
          return apiErr(ApiErrors.Common.InternalServerError, {});
        },
      });

      // 4. 응답 전송
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    } catch {
      this.logger.error(
        `Unhandled domain error: ${exception.code}`,
        exception?.stack,
        JSON.stringify(exception),
      );
      const response = apiErr(ApiErrors.Common.UnhandledDomainError, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
