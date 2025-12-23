import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { BaseDomainEvent, DomainEventPublisherPort } from '@/base';
import { MessageContext, OutboxContext, TransactionContext } from '@/modules/foundation/context';

@Injectable()
export class DomainEventPublisher implements DomainEventPublisherPort {
  constructor(
    private readonly eventBus: EventBus,
    private readonly txContext: TransactionContext,
    private readonly messageContext: MessageContext,
    private readonly outbox: OutboxContext,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publish(event: BaseDomainEvent<any>): Promise<void> {
    this.outbox.domainEventStore.push(event);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async publishMany(events: BaseDomainEvent<any>[]): Promise<void> {
    this.outbox.domainEventStore.push(...events);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.outbox.domainEventStore.clear();
  }

  async flush(): Promise<void> {
    if (this.outbox.domainEventStore.length() === 0) return;
    // 모든 이벤트에 메타데이터 주입 (Causation 추적용)
    const metadata = this.messageContext.getOrThrowDrivenMetadata();
    const events = this.outbox.domainEventStore.list().map((event) => {
      event.updateMetadata(metadata);
      return event;
    });

    // 실제 발행 (NestJS CQRS EventBus)
    this.eventBus.publishAll(events);

    // 버퍼 비우기
    this.clear();
  }
}
