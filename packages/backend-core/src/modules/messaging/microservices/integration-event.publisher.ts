/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MESSAGING_SERVICE_TOKEN } from './microservies.constant';

import {
  BaseIntegrationEvent,
  BaseIntegrationEventProps,
  IntegrationEventPublisherPort,
} from '@/base';
import { MessageContext, TransactionContext } from '@/modules/foundation/context';

@Injectable({ scope: Scope.REQUEST })
export class IntegrationEventPublisher implements IntegrationEventPublisherPort {
  private events: BaseIntegrationEvent<BaseIntegrationEventProps<any>>[] = [];
  private readonly logger = new Logger(IntegrationEventPublisher.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly messageContext: MessageContext,
    private readonly txContext: TransactionContext,
  ) {}

  async publish<TPub extends BaseIntegrationEvent<any>>(pub: TPub) {
    this.events.push(pub);
    if (!this.txContext.isTransactionActive()) {
      await this.flush();
    }
  }

  clear(): void {
    this.events = [];
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;
    const metadata = this.messageContext.getOrThrowDrivenMetadata();

    for (const event of this.events) {
      event.updateMetadata(metadata);
      this.logger.debug(`[Event] Emitting message to pattern: ${event.code}`);
      this.client.emit(event.code, event.toPlain());
    }

    this.clear();
  }
}
