// libs/common/src/events/domain-event.dispatcher.ts
import { Injectable, Scope } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { DomainEvent } from '../../shared/ddd';

@Injectable({ scope: Scope.REQUEST }) // [중요] 요청마다 별도의 버퍼 생성
export class DomainEventDispatcher {
  private events: DomainEvent[] = [];

  constructor(private readonly eventEmitter: EventEmitter2) {}

  // 1. 이벤트를 바로 발행하지 않고 버퍼에 저장
  addEvents(events: DomainEvent[]): void {
    this.events.push(...events);
  }

  // 2. 버퍼 비우기 (롤백 시 사용)
  clear(): void {
    this.events = [];
  }

  // 3. 모아둔 이벤트 실제 발행 (커밋 후 사용)
  async dispatchAll(): Promise<void> {
    await Promise.all(
      this.events.map((event) => this.eventEmitter.emitAsync(event.constructor.name, event)),
    );
    this.clear();
  }
}
