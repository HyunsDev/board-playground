import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { CoreContext } from '../contexts';

@Injectable()
export class HttpApiErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly coreCtx: CoreContext) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      tap((data) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = (data as any)?.body || data;
        if (body && body.code) {
          this.coreCtx.setErrorCode(body.code as string);
        }
      }),
    );
  }
}
