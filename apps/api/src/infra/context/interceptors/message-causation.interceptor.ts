import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

import { ContextService } from '../context.service';

import { BaseCommand, BaseDomainEvent } from '@/shared/base';

@Injectable()
export class MessageCausationInterceptor implements NestInterceptor {
  constructor(private readonly context: ContextService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = context.switchToRpc().getData(); // 이벤트 객체

    if (message instanceof BaseDomainEvent) {
      this.context.setMessageMetadata(message.deriveMetadata());
    }

    if (message instanceof BaseCommand) {
      this.context.setMessageMetadata(message.deriveMetadata());
    }

    return next.handle();
  }
}
