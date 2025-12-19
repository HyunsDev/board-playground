import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AbstractMessage } from '@workspace/backend-ddd';

import { MessageContext } from './contexts';

@Injectable()
export class MessageCausationInterceptor implements NestInterceptor {
  constructor(private readonly messageCtx: MessageContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const message = context.switchToRpc().getData();
    if (message instanceof AbstractMessage) {
      const metadata = message.deriveMetadata();
      this.messageCtx.setMetadata(metadata);
    }
    return next.handle();
  }
}
