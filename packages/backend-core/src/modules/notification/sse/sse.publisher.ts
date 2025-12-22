import { Injectable } from '@nestjs/common';
import z from 'zod';

import { SSEMessageContract } from '@workspace/common';

import { SseIntegrationEvent } from './sse.integration-event';
import { SseScopeEnum } from './sse.types';

import { IntegrationEventPublisherPort } from '@/base';

export type SseEmitTargetOption =
  | {
      scope: SseScopeEnum['Broadcast'];
      targets?: undefined;
    }
  | {
      scope: SseScopeEnum['User'];
      targets: string[];
    };

@Injectable()
export class SsePublisher {
  constructor(private readonly integrationEventPublisher: IntegrationEventPublisherPort) {}

  async emit<C extends SSEMessageContract<string, z.ZodTypeAny>>({
    contract,
    payload,
    target,
  }: {
    contract: C;
    payload: z.infer<C['schema']>;
    target: SseEmitTargetOption;
  }) {
    await this.integrationEventPublisher.publish(
      new SseIntegrationEvent(null, {
        createdAt: new Date().toISOString(),
        event: contract.event,
        scope: target.scope,
        targets: target?.targets,
        payload: payload,
      }),
    );
  }
}
