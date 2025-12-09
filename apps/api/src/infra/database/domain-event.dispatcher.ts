import { Injectable, Scope } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { BaseDomainEvent, CreateMessageMetadata } from '../../shared/base';
import { ContextService } from '../context/context.service';

@Injectable({ scope: Scope.REQUEST })
export class DomainEventDispatcher {
  private events: BaseDomainEvent[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly contextService: ContextService,
  ) {}

  async publishEvents(events: BaseDomainEvent[]): Promise<void> {
    this.events = [...this.events, ...events];
    if (!this.contextService.isTransactionActive()) {
      void (await this.dispatchAll());
    }
  }

  clear(): void {
    this.events = [];
  }

  async dispatchAll(): Promise<void> {
    const metadata: CreateMessageMetadata = this.contextService.getMessageMetadata();

    // 메타데이터 주입
    this.events.forEach((event) => event.setMetadata(metadata));

    // 한 번에 발행
    void this.eventBus.publishAll(this.events);

    this.clear();
  }
}
