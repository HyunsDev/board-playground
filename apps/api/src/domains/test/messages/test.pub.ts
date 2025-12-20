import z from 'zod';

import { BaseIntegrationEvent, BaseIntegrationEventProps } from '@workspace/backend-core';
import { asIntegrationEventCode, DomainCodeEnums } from '@workspace/domain';

type TestPubProps = BaseIntegrationEventProps<{
  message: string;
}>;
const TestPubSchema = z.object({
  message: z.string(),
});
export class TestPub extends BaseIntegrationEvent<TestPubProps> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asIntegrationEventCode('system:devtools:pub:test');
  get schema() {
    return TestPubSchema;
  }
}
