/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MESSAGING_SERVICE_TOKEN } from './microservies.constant';

import { BaseIntegrationEvent, IntegrationEventPublisherPort } from '@/base';
import { MessageContext, OutboxContext, TransactionContext } from '@/modules/foundation/context';

@Injectable()
export class IntegrationEventPublisher implements IntegrationEventPublisherPort {
  private readonly logger = new Logger(IntegrationEventPublisher.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly messageContext: MessageContext,
    private readonly txContext: TransactionContext,
    private readonly outbox: OutboxContext,
  ) {}

  async publish<TPub extends BaseIntegrationEvent<any>>(pub: TPub) {
    this.outbox.integrationEventStore.push(pub);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.outbox.integrationEventStore.clear();
  }

  async flush(): Promise<void> {
    const events = this.outbox.integrationEventStore.list();
    if (events.length === 0) return;
    const metadata = this.messageContext.getOrThrowDrivenMetadata();

    for (const event of events) {
      event.updateMetadata(metadata);
      this.logger.debug(`[Event] Emitting message to pattern: ${event.code}`);
      this.client.emit(event.code, event.toPlain());
    }

    this.clear();
  }
}
