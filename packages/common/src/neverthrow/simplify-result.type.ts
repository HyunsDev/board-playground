/* eslint-disable @typescript-eslint/no-explicit-any */
import { Err, Ok, Result } from 'neverthrow';

/**
 * Result 타입 결과를 단순화하는 유틸리티 타입
 */
export type SimplifyResult<R> = Result<
  R extends Ok<infer T, any> ? T : never,
  R extends Err<any, infer E> ? E : never
>;
