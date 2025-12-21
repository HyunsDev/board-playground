/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { err, ok } from 'neverthrow';
import { firstValueFrom, map, timeout } from 'rxjs';

import { MessageResult } from '@workspace/backend-ddd';

import { MESSAGING_SERVICE_TOKEN } from './messaging.constant';

import { BaseRpc } from '@/base';
import { MessageContext } from '@/modules/context';

@Injectable()
export class RpcClient {
  private readonly logger = new Logger(RpcClient.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly messageContext: MessageContext,
  ) {}

  async send<TRpc extends BaseRpc<any, any, any>, TResult = MessageResult<TRpc>>(
    rpc: TRpc,
    { timeoutMs }: { timeoutMs?: number } = { timeoutMs: 5000 },
  ): Promise<TResult> {
    const metadata = this.messageContext.getOrThrowDrivenMetadata();
    const timeoutMsFinal = rpc.options.timeoutMs ?? timeoutMs ?? 5000;
    rpc.updateMetadata(metadata);

    this.logger.debug(`[RPC] Sending message to pattern: ${rpc.code}`);

    try {
      return await firstValueFrom(
        this.client.send<TResult>(rpc.code, rpc.toPlain()).pipe(
          timeout(timeoutMsFinal),
          map((response) => this.restoreNeverthrow<TResult>(response)),
        ),
      );
    } catch (error) {
      this.logger.error(`[RPC] Error processing pattern ${rpc.code}`, error);
      throw error;
    }
  }

  private restoreNeverthrow<T>(response: any): T {
    if (!response || typeof response !== 'object') {
      return response;
    }

    if ('value' in response && !('error' in response)) {
      return ok(response.value) as unknown as T;
    }

    if ('error' in response && !('value' in response)) {
      return err(response.error) as unknown as T;
    }

    return response;
  }
}
