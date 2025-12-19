import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';

import { RpcCode } from '@workspace/domain';

import { MESSAGING_SERVICE_TOKEN } from './messaging.constant';
import { CoreContext } from '../context/contexts/core.context';

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @Inject(MESSAGING_SERVICE_TOKEN) private readonly client: ClientProxy,
    private readonly coreContext: CoreContext,
  ) {}

  async send<TResult, TInput>(
    pattern: RpcCode,
    data: TInput,
    timeoutMs: number = 5000,
  ): Promise<TResult> {
    const payload = this.wrapWithContext(data);

    this.logger.debug(`[RPC] Sending message to pattern: ${pattern}`);

    try {
      return await firstValueFrom(
        this.client.send<TResult>(pattern, payload).pipe(timeout(timeoutMs)),
      );
    } catch (error) {
      this.logger.error(`[RPC] Error processing pattern ${pattern}`, error);
      throw error;
    }
  }

  emit<TInput>(pattern: string, data: TInput): void {
    const payload = this.wrapWithContext(data);

    this.logger.debug(`[Event] Emitting message to pattern: ${pattern}`);

    this.client.emit(pattern, payload);
  }

  private wrapWithContext<T>(data: T) {
    const traceId = this.coreContext.requestId;

    return {
      data,
      metadata: {
        traceId,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
