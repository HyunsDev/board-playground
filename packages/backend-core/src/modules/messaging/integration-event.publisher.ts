/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { MESSAGING_SERVICE_TOKEN } from './messaging.constant';
import { MessageContext } from '../context';

import { BasePub } from '@/base';

@Injectable()
export class IntegrationEventPublisher {
  private readonly logger = new Logger(IntegrationEventPublisher.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly messageContext: MessageContext,
  ) {}

  publish<TPub extends BasePub<any>>(pub: TPub): void {
    const metadata = this.messageContext.getOrThrowDrivenMetadata();
    pub.updateMetadata(metadata);

    this.logger.debug(`[Event] Emitting message to pattern: ${pub.code}`);

    this.client.emit(pub.code, pub.toPlain());
  }
}
