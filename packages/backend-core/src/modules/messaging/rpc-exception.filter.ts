import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

import { SystemException } from '@workspace/backend-ddd';

@Catch()
export class GlobalRpcExceptionFilter implements RpcExceptionFilter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch(exception: unknown, _host: ArgumentsHost): Observable<any> {
    if (exception instanceof RpcException) {
      return throwError(() => exception.getError());
    }

    if (exception instanceof SystemException) {
      const errorBody = {
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
      return throwError(() => errorBody);
    }

    const defaultError = {
      code: 'INTERNAL_SERVER_ERROR',
      message: (exception as Error)?.message || 'Internal server error',
    };

    return throwError(() => defaultError);
  }
}
