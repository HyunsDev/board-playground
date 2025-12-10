/**
 * 2차원 객체 타입의 값들을 가져오는 유틸리티 타입
 *
 * @example
 * ```typescript
 * type Example = {
 *   a: { x: "a"; y: "b" };
 *   b: { z: "c" };
 * };
 * type Result = DistributiveValueOf<Example>;  // "a" | "b" | "c"
 * ```
 */
export type DistributiveValueOf<T> = {
  [K in keyof T]: T[K][keyof T[K]];
}[keyof T];
