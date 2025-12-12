/* eslint-disable @typescript-eslint/no-explicit-any */
// ==========================================
// 1. 에러 메시지 생성용 타입
// ==========================================
type ErrorMessage<Key extends string | number | symbol> = `${string & Key} (⚠️ conflict)`;

// ==========================================
// 2. 순수 병합 로직 (타입 계산용 - 결과물 추론)
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
// 3. 충돌 검사 로직 (Validation)
// ==========================================

/**
 * Acc(누적)와 Curr(현재)를 비교.
 * 충돌 시 Curr의 해당 필드 타입을 '에러 메시지 문자열'로 바꿔버림.
 */
type CheckConflict<Acc, Curr> = {
  [K in keyof Curr]: K extends keyof Acc
    ? Acc[K] extends Record<string, any>
      ? Curr[K] extends Record<string, any>
        ? CheckConflict<Acc[K], Curr[K]> // 둘 다 객체면 재귀
        : ErrorMessage<K> // Acc는 객체인데 Curr는 값 -> 충돌
      : ErrorMessage<K> // Acc가 이미 값인데 덮어쓰려 함 -> 충돌
    : Curr[K]; // 중복 없으면 통과
};

/**
 * 튜플을 순회하며 검증.
 * T가 [A, B, C] 라면
 * 1. A 검사 (Acc: {})
 * 2. B 검사 (Acc: A)
 * 3. C 검사 (Acc: A & B)
 */
type StrictArgValidator<T extends any[], Acc = object> = T extends [infer Head, ...infer Tail]
  ? [
      // 현재 인자(Head)를 Acc와 비교해서 검증된 타입으로 변환
      CheckConflict<Acc, Head>,
      // 다음 인자를 위해 재귀 호출 (Acc에 Head 병합해서 넘김)
      ...StrictArgValidator<Tail, DeepMergeTwo<Acc, Head>>,
    ]
  : T; // 재귀 종료 시 T(보통 빈 배열) 반환

// ==========================================
// 4. 결과물 타입 계산 (DeepMergeAll)
// ==========================================
type DeepMergeAll<T extends any[]> = T extends [infer Head, ...infer Tail]
  ? Tail extends []
    ? Head
    : DeepMergeTwo<Head, DeepMergeAll<Tail>>
  : unknown;

// ==========================================
// 5. 런타임 구현
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
        output[key] = mergeTwo(target[key], source[key]);
      }
    } else {
      if (key in target) {
        throw new Error(`Merge Conflict: Duplicate key detected for '${key}'`);
      }
      Object.assign(output, { [key]: source[key] });
    }
  });
  return output;
}

/**
 * Safe Deep Merge
 * 중복된 키가 있으면 타입 에러 메시지를 띄웁니다.
 */
export function safeDeepMerge<T extends any[]>(
  // 여기서 T를 추론한 뒤, Validator를 통해 타입을 강제합니다.
  ...objects: [...StrictArgValidator<T>]
): DeepMergeAll<T> {
  if (objects.length === 0) return {} as any;
  return objects.reduce((prev, curr) => mergeTwo(prev, curr), {}) as DeepMergeAll<T>;
}
