import z from 'zod';

import { BasePubProps, BasePub } from '@workspace/backend-core';
import { DomainCodeEnums, asPubCode } from '@workspace/domain';

type TestPubProps = BasePubProps<{
  message: string;
}>;
const TestPubSchema = z.object({
  message: z.string(),
});
export class TestPub extends BasePub<TestPubProps> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asPubCode('system:devtools:pub:test');
  get schema() {
    return TestPubSchema;
  }
}
