/* eslint-disable @typescript-eslint/no-explicit-any */

// 두 타입을 Deep Merge 하는 유틸리티 타입
type DeepMergeTwo<T, U> = T extends object
  ? U extends object
    ? {
        [K in keyof T | keyof U]: K extends keyof T
          ? K extends keyof U
            ? DeepMergeTwo<T[K], U[K]> // 둘 다 있으면 재귀 병합
            : T[K] // T에만 있음
          : K extends keyof U
            ? U[K] // U에만 있음
            : never;
      }
    : U // U가 객체가 아니면 덮어씀
  : U; // T가 객체가 아니면 덮어씀

// 튜플(배열) 타입을 재귀적으로 순회하며 병합
// T가 [A, B, C]라면 -> DeepMergeTwo<A, DeepMergeTwo<B, C>> 형태로 축소됨
type DeepMergeAll<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? Head
    : DeepMergeTwo<Head, DeepMergeAll<Tail>>
  : unknown;

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeTwo(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeTwo(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

/**
 * 두 개 이상의 객체를 깊은 병합(Deep Merge)하는 유틸리티 함수
 * @param objects 병합할 객체들
 * @returns 병합된 객체
 *
 * @example
 * const obj1 = { a: 1, b: { c: 2 } };
 * const obj2 = { b: { d: 3 }, e: 4 };
 * const merged = deepMerge(obj1, obj2);
 * { a: 1, b: { c: 2, d: 3 }, e: 4 }
 */
export function deepMerge<T extends any[]>(...objects: T): DeepMergeAll<T> {
  return objects.reduce((prev, curr) => mergeTwo(prev, curr), {}) as DeepMergeAll<T>;
}
