import { Injectable, Scope } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { BaseDomainEvent, CreateMessageMetadata } from '../../shared/base';
import { ContextService } from '../context/context.service';

@Injectable({ scope: Scope.REQUEST })
export class DomainEventPublisher {
  private events: BaseDomainEvent[] = [];

  constructor(
    private readonly eventBus: EventBus,
    private readonly contextService: ContextService,
  ) {}

  async publish(event: BaseDomainEvent): Promise<void> {
    this.events = [...this.events, event];
    if (!this.contextService.isTransactionActive()) {
      void (await this.flush());
    }
  }

  async publishMany(events: BaseDomainEvent[]): Promise<void> {
    this.events = [...this.events, ...events];
    if (!this.contextService.isTransactionActive()) {
      void (await this.flush());
    }
  }

  clear(): void {
    this.events = [];
  }

  async flush(): Promise<void> {
    const metadata: CreateMessageMetadata = this.contextService.getMessageMetadata();
    this.events.forEach((event) => event.setMetadata(metadata));
    void this.eventBus.publishAll(this.events);
    this.clear();
  }
}
