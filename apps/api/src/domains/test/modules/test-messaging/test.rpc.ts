import z from 'zod';

import { BaseRpc, BaseRpcProps } from '@workspace/backend-core';
import { DomainResult } from '@workspace/backend-ddd';
import { asRpcCode, DomainCodeEnums } from '@workspace/domain';

type TestRpcProps = BaseRpcProps<{
  ping: string;
}>;
const TestRpcSchema = z.object({
  ping: z.string(),
});
export class TestRpc extends BaseRpc<
  TestRpcProps,
  { pong: string },
  DomainResult<{ pong: string }, never>
> {
  readonly resourceType = DomainCodeEnums.System.Notification;
  static readonly code = asRpcCode('system:devtools:rpc:test');
  get schema() {
    return TestRpcSchema;
  }
}
