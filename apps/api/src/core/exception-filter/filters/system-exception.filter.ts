import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { CoreSystemException, systemLog, SystemLogActionEnum } from '@workspace/backend-core';
import { SystemException, matchError, apiErr, DDDSystemException } from '@workspace/backend-ddd';
import { ApiErrors } from '@workspace/contract';
import { DomainCodeEnums } from '@workspace/domain';

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
            systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InternalError, {
              msg: `Internal server error: ${err.details?.error?.code}`,
              error: err,
            }),
            exception?.stack,
          );
          return apiErr(ApiErrors.Common.InternalServerError);
        },
        UnexpectedDomainError: (err) => {
          this.logger.error(
            systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InternalError, {
              msg: `Unexpected domain error: ${err.details?.error?.code}`,
              error: err,
            }),
            exception?.stack,
          );
          return apiErr(ApiErrors.Common.UnexpectedDomainError);
        },
        InvariantViolation: (err) => {
          this.logger.error(
            systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InternalError, {
              msg: `Invariant violation: ${err.message}`,
              error: err,
            }),
            exception?.stack,
          );
          return apiErr(ApiErrors.Common.InternalServerError, {});
        },
        CacheInfrastructureError: (err) => {
          this.logger.error(
            systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InternalError, {
              msg: `Cache infrastructure error: ${err.details?.key}`,
              error: err,
            }),
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
        systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InternalError, {
          msg: `Unhandled domain error: ${exception.code}`,
          error: exception,
        }),
        exception?.stack,
        JSON.stringify(exception),
      );
      const response = apiErr(ApiErrors.Common.UnhandledDomainError, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
