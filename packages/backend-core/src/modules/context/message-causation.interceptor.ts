import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AbstractMessage } from '@workspace/backend-ddd/dist/messages/internal/abstract.message';

import { ContextService } from './context.service';

@Injectable()
export class MessageCausationInterceptor implements NestInterceptor {
  constructor(private readonly context: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const message = context.switchToRpc().getData();
    if (message instanceof AbstractMessage) {
      this.context.setMessageMetadata(message.deriveMetadata());
    }
    return next.handle();
  }
}
