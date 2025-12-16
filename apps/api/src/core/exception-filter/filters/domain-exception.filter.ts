import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { systemLog, SystemLogActionEnum } from '@workspace/backend-core';
import {
  apiErr,
  DomainException,
  InvariantViolationException,
  matchPublicError,
} from '@workspace/backend-ddd';
import { ApiErrors } from '@workspace/contract';
import { DomainCodeEnums } from '@workspace/domain';

import { GlobalDomainError } from '../global-domain-error.type';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  private readonly logger = new Logger(DomainExceptionFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: DomainException<GlobalDomainError>, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const error = exception?.error;
    try {
      if (error.scope !== 'public') {
        this.logger.error(
          systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InvariantViolation, {
            msg: `Non-public domain error caught in DomainExceptionFilter: ${error.code}`,
            error,
          }),
        );

        const response = apiErr(ApiErrors.Common.UnhandledDomainError, {});
        void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
        return;
      }

      const response = matchPublicError(error, {
        AccessDenied: () => apiErr(ApiErrors.Common.AccessDenied),
        InvalidAccessToken: () => apiErr(ApiErrors.Auth.AccessTokenInvalid),
        ExpiredToken: () => apiErr(ApiErrors.Auth.AccessTokenExpired),
        MissingToken: () => apiErr(ApiErrors.Auth.AccessTokenMissing),
      });

      // 4. 응답 전송
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    } catch (err: unknown) {
      if (err instanceof InvariantViolationException) {
        this.logger.error(
          systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InvariantViolation, {
            msg: `Invariant violation in DomainExceptionFilter: ${err.message}`,
            error: err,
          }),
        );
        const response = apiErr(ApiErrors.Common.UnhandledDomainError, {});
        void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
        return;
      }

      this.logger.error(
        systemLog(DomainCodeEnums.System.Exception, SystemLogActionEnum.InvariantViolation, {
          msg: `Unexpected error in DomainExceptionFilter: ${error?.code}`,
          error: err,
        }),
      );
      const response = apiErr(ApiErrors.Common.InternalServerError, {});
      void httpAdapter.reply(ctx.getResponse(), response.body, response.status);
    }
  }
}
