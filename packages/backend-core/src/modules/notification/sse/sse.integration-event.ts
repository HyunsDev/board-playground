import { asIntegrationEventCode, DomainCodeEnums } from '@workspace/domain';

import { SseEmitOptions, SseEmitOptionsSchema } from './sse.types';

import { BaseIntegrationEvent, BaseIntegrationEventProps } from '@/base';

export type SseIntegrationEventProps = BaseIntegrationEventProps<SseEmitOptions>;

export class SseIntegrationEvent extends BaseIntegrationEvent<SseIntegrationEventProps> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asIntegrationEventCode('system:notification:pub:sse');
  get schema() {
    return SseEmitOptionsSchema;
  }
}
