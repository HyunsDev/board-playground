import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';

import { ContextService } from '../context.service';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  constructor(private readonly contextService: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const res = http.getResponse<Response>();
    const requestId = this.contextService.getRequestId();

    if (requestId) {
      void res.setHeader('X-Request-Id', requestId);
    }

    return next.handle();
  }
}
