import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

import { AbstractCommand, AbstractDomainEvent } from '@workspace/backend-ddd';

import { ContextService } from './context.service';

@Injectable()
export class MessageCausationInterceptor implements NestInterceptor {
  constructor(private readonly context: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const message = context.switchToRpc().getData();
    if (message instanceof AbstractDomainEvent || message instanceof AbstractCommand) {
      this.context.setMessageMetadata(message.deriveMetadata());
    }
    return next.handle();
  }
}
