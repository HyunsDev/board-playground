import { Injectable, Scope } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { AbstractDomainEvent } from '@workspace/backend-ddd';

import { DomainEventPublisherPort } from '@/base';
import { MessageContext, TransactionContext } from '@/modules/foundation/context';

@Injectable({ scope: Scope.REQUEST })
export class DomainEventPublisher implements DomainEventPublisherPort {
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
    if (this.events.length === 0) return;

    // 모든 이벤트에 메타데이터 주입 (Causation 추적용)
    const metadata = this.messageContext.getOrThrowDrivenMetadata();
    this.events.forEach((event) => event.updateMetadata(metadata));

    // 실제 발행 (NestJS CQRS EventBus)
    this.eventBus.publishAll(this.events);

    // 버퍼 비우기
    this.clear();
  }
}
