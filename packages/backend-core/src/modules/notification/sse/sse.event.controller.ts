import { Controller } from '@nestjs/common';
import { ok } from 'neverthrow';

import { SseConnectionService } from './sse-connection.service';
import { SseIntegrationEvent } from './sse.integration-event';
import { SseScopeEnum } from './sse.types';

import { HandleIntegrationEvent } from '@/modules/messaging';

@Controller()
export class SseEventController {
  constructor(private readonly sseService: SseConnectionService) {}

  @HandleIntegrationEvent(SseIntegrationEvent)
  async handleNotification(event: SseIntegrationEvent) {
    this.sseService.emit({
      scope: SseScopeEnum.Broadcast,
      event: event.data.event,
      targets: event.data.targets,
      payload: event.data.payload,
      createdAt: event.data.createdAt,
    });
    return ok(undefined);
  }
}
