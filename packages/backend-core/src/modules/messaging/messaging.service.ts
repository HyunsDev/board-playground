/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { MessageResult } from '@workspace/backend-ddd';

import { MESSAGING_SERVICE_TOKEN } from './messaging.constant';
import { MessageContext } from '../context';

import { BasePub, BaseRpc } from '@/base';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly messageContext: MessageContext,
  ) {}

  async send<TRpc extends BaseRpc<any, any, any>, TResult = MessageResult<TRpc>>(
    rpc: TRpc,
    { timeoutMs }: { timeoutMs?: number } = { timeoutMs: 5000 },
  ): Promise<TResult> {
    const metadata = this.messageContext.drivenMetadata;
    const timeoutMsFinal = rpc.options.timeoutMs ?? timeoutMs ?? 5000;
    rpc.updateMetadata(metadata);

    this.logger.debug(`[RPC] Sending message to pattern: ${rpc.code}`);

    try {
      return await firstValueFrom(
        this.client.send<TResult>(rpc.code, rpc.toPlain()).pipe(timeout(timeoutMsFinal)),
      );
    } catch (error) {
      this.logger.error(`[RPC] Error processing pattern ${rpc.code}`, error);
      throw error;
    }
  }

  emit<TPub extends BasePub<any>>(pub: TPub): void {
    const metadata = this.messageContext.drivenMetadata;
    pub.updateMetadata(metadata);

    this.logger.debug(`[Event] Emitting message to pattern: ${pub.code}`);

    this.client.emit(pub.code, pub.toPlain());
  }
}
