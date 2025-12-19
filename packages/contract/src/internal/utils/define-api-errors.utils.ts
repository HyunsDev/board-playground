// ==========================================
// 1. defineErrorRecord: 단일 그룹 내 중복 방지
// ==========================================

import type { ApiError } from '@workspace/common';

// T 내의 다른 키들이 가진 code들의 Union을 추출하는 타입
type OtherCodesInRecord<T, K extends keyof T> = {
  [P in keyof T]: P extends K
    ? never // 자기 자신 제외
    : T[P] extends { code: infer C }
      ? C
      : never;
}[keyof T];

// 그룹 내에서 중복된 code가 있는지 검사하는 타입
type ValidateLocalUnique<T> = {
  [K in keyof T]: T[K] extends { code: infer CurrentCode }
    ? CurrentCode extends OtherCodesInRecord<T, K>
      ? {
          // 🚨 에러 발생 시 타입 형태를 망가뜨려 할당을 막고 메시지를 띄움
          status: number;
          code: `🚨 DUPLICATE_IN_RECORD: ${CurrentCode & string} 🚨`;
          message: string;
        }
      : T[K]
    : never;
};

/**
 * 개별 에러 그룹(예: UserApiErrors)을 정의할 때 사용합니다.
 * 그룹 내부에서 code가 중복되면 타입 에러를 발생시킵니다.
 */
export const defineErrorRecord = <T extends Record<string, ApiError>>(
  errors: T & ValidateLocalUnique<T>,
): T => errors;

// ==========================================
// 2. defineApiErrors: 그룹 간 중복 방지
// ==========================================

type GetAllCodesExceptCategory<T, ExcludingCategory extends keyof T> = {
  [Cat in keyof T]: Cat extends ExcludingCategory
    ? never
    : T[Cat][keyof T[Cat]] extends { code: infer C }
      ? C
      : never;
}[keyof T];

type ValidateGlobalUnique<T> = {
  [Category in keyof T]: {
    [ErrorKey in keyof T[Category]]: T[Category][ErrorKey] extends { code: infer CurrentCode }
      ? CurrentCode extends GetAllCodesExceptCategory<T, Category>
        ? { error: `🚨 DUPLICATE_ACROSS_CATEGORIES: ${CurrentCode & string} 🚨` }
        : T[Category][ErrorKey]
      : never;
  };
};

/**
 * 전체 에러 상수(ApiErrors)를 정의할 때 사용합니다.
 * 서로 다른 그룹 간에 code가 중복되면 타입 에러를 발생시킵니다.
 */
export const defineApiErrors = <T extends Record<string, Record<string, ApiError>>>(
  apiErrors: T & ValidateGlobalUnique<T>,
): T => apiErrors;
