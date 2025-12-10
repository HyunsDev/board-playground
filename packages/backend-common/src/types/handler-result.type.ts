import { SimplifyResult } from '@workspace/common';

export type HandlerResult<T extends { execute: (...args: any) => any }> = SimplifyResult<
  Awaited<ReturnType<T['execute']>>
>;
