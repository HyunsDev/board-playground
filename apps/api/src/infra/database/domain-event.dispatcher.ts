// libs/common/src/events/domain-event.dispatcher.ts
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BaseDomainEvent, CreateMessageMetadata } from '../../shared/base';
import { ContextService } from '../context/context.service';

@Injectable({ scope: Scope.REQUEST }) // [중요] 요청마다 별도의 버퍼 생성
export class DomainEventDispatcher {
  private events: BaseDomainEvent[] = [];

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly contextService: ContextService,
  ) {}

  async publishEvents(events: BaseDomainEvent[]): Promise<void> {
    this.events = [...this.events, ...events];
    if (!this.contextService.isTransactionActive()) {
      void (await this.dispatchAll());
    }
  }

  // 2. 버퍼 비우기 (롤백 시 사용)
  clear(): void {
    this.events = [];
  }

  // 3. 모아둔 이벤트 실제 발행 (커밋 후 사용)
  async dispatchAll(): Promise<void> {
    const metadata: CreateMessageMetadata = this.contextService.getMessageMetadata();
    const _ = await Promise.all(
      this.events.map((event) => {
        event.setMetadata(metadata);
        return this.eventEmitter.emitAsync(event.constructor.name, event);
      }),
    );
    this.clear();
  }
}
