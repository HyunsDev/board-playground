import { SimplifyResult } from './simplify-result.type';

export type HandlerResult<T extends { execute: (...args: any) => any }> = SimplifyResult<
  Awaited<ReturnType<T['execute']>>
>;
