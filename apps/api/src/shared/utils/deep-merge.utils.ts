// 1. [기본 로직] 두 타입을 Deep Merge 하는 유틸리티
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

// 2. [핵심 로직] 튜플(배열) 타입을 재귀적으로 순회하며 병합
// T가 [A, B, C]라면 -> DeepMergeTwo<A, DeepMergeTwo<B, C>> 형태로 축소됨
type DeepMergeAll<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? Head
    : DeepMergeTwo<Head, DeepMergeAll<Tail>>
  : unknown;

// 3. [런타임] 헬퍼 함수들
function isObject(item: any): item is object {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeTwo(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          // eslint-disable-next-line functional/no-expression-statements
          Object.assign(output, { [key]: source[key] });
        } else {
          // eslint-disable-next-line functional/no-expression-statements
          output[key] = mergeTwo(target[key], source[key]);
        }
      } else {
        void Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

// 4. [메인 함수] 가변 인자(...objects)를 받아서 처리
// 제네릭 T를 튜플로 추론하게 하여 리터럴 타입을 보존
export function deepMerge<T extends any[]>(...objects: T): DeepMergeAll<T> {
  return objects.reduce((prev, curr) => mergeTwo(prev, curr), {}) as DeepMergeAll<T>;
}
