import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { TriggerCode } from '@workspace/domain';

import { TRIGGER_KEY } from '../context.constants';
import { MessageContext } from '../contexts';

@Injectable()
export class TriggerContextInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly messageContext: MessageContext,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const trigger = this.reflector.get<TriggerCode | undefined>(TRIGGER_KEY, context.getHandler());

    if (trigger) {
      const metadata = this.messageContext.createMetadata(trigger);
      this.messageContext.setMetadata(metadata);
    }

    return next.handle();
  }
}
