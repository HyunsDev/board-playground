/* eslint-disable @typescript-eslint/no-explicit-any */

// ==========================================
// 0. 유틸리티 타입: 두 타입이 '정확히' 일치하는지 확인
// ==========================================
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false;

// ==========================================
// 1. 에러 메시지 생성용 타입
// ==========================================
type ErrorMessage<Key extends string | number | symbol> = `${string & Key} (⚠️ conflict)`;

// ==========================================
// 2. 순수 병합 로직 (결과물 추론)
// (값이 같으면 U[K]를 취해도 상관없으므로 기존 로직 유지)
// ==========================================
type DeepMergeTwo<T, U> =
  T extends Record<string, any>
    ? U extends Record<string, any>
      ? {
          [K in keyof T | keyof U]: K extends keyof T
            ? K extends keyof U
              ? DeepMergeTwo<T[K], U[K]>
              : T[K]
            : K extends keyof U
              ? U[K]
              : never;
        }
      : U
    : U;

// ==========================================
// 3. 충돌 검사 로직 (Validation - 수정됨)
// ==========================================

/**
 * 변경점: 충돌이 감지되었을 때,
 * Equal<Acc[K], Curr[K]>가 true라면 (값/타입이 동일하다면) 에러를 내지 않고 통과시킵니다.
 */
type CheckConflict<Acc, Curr> = {
  [K in keyof Curr]: K extends keyof Acc
    ? Equal<Acc[K], Curr[K]> extends true // 1. 타입(값)이 완전히 동일한가?
      ? Curr[K] // 동일하면 허용 (에러 아님)
      : Acc[K] extends Record<string, any>
        ? Curr[K] extends Record<string, any>
          ? CheckConflict<Acc[K], Curr[K]> // 2. 둘 다 객체면 재귀 검사
          : ErrorMessage<K> // 객체 vs 원시값 -> 에러
        : ErrorMessage<K> // 원시값 vs 원시값(다른 값) -> 에러
    : Curr[K]; // 중복 없으면 통과
};

/**
 * 튜플 검증 로직
 */
type StrictArgValidator<T extends any[], Acc = object> = T extends [infer Head, ...infer Tail]
  ? [CheckConflict<Acc, Head>, ...StrictArgValidator<Tail, DeepMergeTwo<Acc, Head>>]
  : T;

// ==========================================
// 4. 결과물 타입 계산 (DeepMergeAll)
// ==========================================
type DeepMergeAll<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? Head
    : DeepMergeTwo<Head, DeepMergeAll<Tail>>
  : unknown;

// ==========================================
// 5. 런타임 구현 (수정됨)
// ==========================================

function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeTwo(target: any, source: any): any {
  if (!isObject(target) || !isObject(source)) {
    throw new Error(`Merge Conflict: Cannot merge non-object types.`);
  }
  const output = { ...target };

  Object.keys(source).forEach((key) => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        // 둘 다 객체인 경우 재귀 호출 (여기서 내부 값 충돌 체크가 일어남)
        output[key] = mergeTwo(target[key], source[key]);
      }
    } else {
      if (key in target) {
        // 변경점: 값이 다를 때만 에러 발생
        if (target[key] !== source[key]) {
          throw new Error(`Merge Conflict: Duplicate key detected for '${key}'`);
        }
        // 값이 같으면 덮어쓰기(혹은 무시)하고 넘어감
      }
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
}

/**
 * Safe Deep Merge
 * 중복된 키가 있고 값이 다르면 타입 에러 메시지를 띄웁니다.
 */
export function safeDeepMerge<T extends any[]>(
  ...objects: [...StrictArgValidator<T>]
): DeepMergeAll<T> {
  if (objects.length === 0) return {} as any;
  return objects.reduce((prev, curr) => mergeTwo(prev, curr), {}) as DeepMergeAll<T>;
}
