import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { CoreSystemException } from '@workspace/backend-core';
import { SystemException, matchError, apiErr, DDDSystemException } from '@workspace/backend-ddd';
import { ApiErrors } from '@workspace/contract';

type GlobalSystemException = DDDSystemException | CoreSystemException;

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
        CacheInfrastructureError: (err) => {
          this.logger.error(
            `Cache infrastructure error: ${err.details?.key}`,
            exception?.stack,
            JSON.stringify(err.details?.originalError),
          );
          return apiErr(ApiErrors.Common.InternalServerError);
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
