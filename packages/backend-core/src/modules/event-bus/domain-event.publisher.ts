import { Injectable, Scope } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainEventPublisherPort, AbstractDomainEvent } from '@workspace/backend-ddd';

import { ContextService } from '../context/context.service';

@Injectable({ scope: Scope.REQUEST }) // 요청(트랜잭션) 단위로 상태를 유지해야 하므로 REQUEST 스코프 필수
export class NestJSDomainEventPublisher implements DomainEventPublisherPort {
  private events: AbstractDomainEvent<string, string, string>[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly contextService: ContextService,
  ) {}

  async publish(event: AbstractDomainEvent<string, string, string>): Promise<void> {
    this.events.push(event);
    // 트랜잭션이 활성화되어 있지 않다면 즉시 발행
    if (!this.contextService.isTransactionActive()) {
      await this.flush();
    }
  }

  async publishMany(events: AbstractDomainEvent<string, string, string>[]): Promise<void> {
    this.events.push(...events);
    if (!this.contextService.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.events = [];
  }

  async flush(): Promise<void> {
    // 1. Context에서 메타데이터(TraceId, UserId 등) 가져오기
    // (ContextService 리팩토링 때 정의한 getMessageMetadata 사용)
    const metadata = this.contextService.getMessageMetadata();

    // 2. 모든 이벤트에 메타데이터 주입 (Causation 추적용)
    if (metadata) {
      this.events.forEach((event) => event.setMetadata(metadata));
    }

    // 3. 실제 발행 (NestJS CQRS EventBus)
    this.eventBus.publishAll(this.events);

    // 4. 버퍼 비우기
    this.clear();
  }
}
