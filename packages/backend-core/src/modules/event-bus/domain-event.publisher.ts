import { Injectable, Scope } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { DomainEventPublisherPort, AbstractDomainEvent } from '@workspace/backend-ddd';

import { MessageContext, TransactionContext } from '../context';

@Injectable({ scope: Scope.REQUEST })
export class NestJSDomainEventPublisher implements DomainEventPublisherPort {
  private events: AbstractDomainEvent<string, string, string>[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly txContext: TransactionContext,
    private readonly messageContext: MessageContext,
  ) {}

  async publish(event: AbstractDomainEvent<string, string, string>): Promise<void> {
    this.events.push(event);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  async publishMany(events: AbstractDomainEvent<string, string, string>[]): Promise<void> {
    this.events.push(...events);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.events = [];
  }

  async flush(): Promise<void> {
    // Context에서 메타데이터(TraceId, UserId 등) 가져오기
    const metadata = this.messageContext.drivenMetadata;

    // 모든 이벤트에 메타데이터 주입 (Causation 추적용)
    if (metadata) {
      this.events.forEach((event) => event.updateMetadata(metadata));
    }

    // 실제 발행 (NestJS CQRS EventBus)
    this.eventBus.publishAll(this.events);

    // 버퍼 비우기
    this.clear();
  }
}
