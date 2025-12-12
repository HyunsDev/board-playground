import { SimplifyResult } from '@workspace/common';

/**
 * Handler의 execute 메서드의 반환 타입을 추출하는 유틸리티 타입
 */
export type HandlerResult<T extends { execute: (...args: unknown[]) => unknown }> = SimplifyResult<
  Awaited<ReturnType<T['execute']>>
>;
