import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { AbstractMessage } from '@workspace/backend-ddd';
import { TriggerCode } from '@workspace/domain';

import { TRIGGER_KEY } from '../context.constants';
import { MessageTriggerNotFoundException } from '../context.exceptions';
import { MessageContext } from '../contexts';

@Injectable()
export class MessageInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly messageContext: MessageContext,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const message = this.getMessage(context);

    if (!(message instanceof AbstractMessage)) {
      return next.handle();
    }

    // --------------------------------------------------------
    // Phase 1: 메타데이터 주입 (Trigger Logic)
    // --------------------------------------------------------

    if (!message.hasMetadata()) {
      let newMetadata = this.messageContext.drivenMetadata;
      if (!newMetadata) {
        const triggerCode = this.reflector.getAllAndOverride<TriggerCode>(TRIGGER_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
        if (!triggerCode) {
          throw new MessageTriggerNotFoundException();
        }
        newMetadata = this.messageContext.createMetadata(triggerCode);
      }

      message.updateMetadata(newMetadata);
    }

    // --------------------------------------------------------
    // Phase 2: 컨텍스트 설정 (Causation Logic)
    // --------------------------------------------------------

    // 이제 메시지에는 반드시 메타데이터가 존재합니다. (Phase 1 또는 외부 주입 덕분)
    // 이 메타데이터를 CLS(Context)에 등록하여, 이후 로직(로그, 이벤트 발행 등)에서 사용하게 합니다.

    const currentMetadata = message.deriveMetadata();
    this.messageContext.setMetadata(currentMetadata);

    return next.handle();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getMessage(context: ExecutionContext): any {
    const rpcData = context.switchToRpc().getData();
    const httpBody = context.switchToHttp().getRequest()?.body;
    return rpcData || httpBody;
  }
}
