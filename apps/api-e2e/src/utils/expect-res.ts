/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from '@jest/globals';

import { ApiError, ApiResponse } from '@workspace/common';

export type SuccessBody<T> = T extends { status: number; body: infer B }
  ? `${T['status']}` extends `2${string}` // status를 문자열로 바꿔 "2"로 시작하는지 확인
    ? B
    : never
  : never;

export interface JestMatcher {
  asymmetricMatch(other: unknown): boolean;
  [key: string]: any;
}

export type Matchable<T> = {
  [K in keyof T]: T[K] extends object ? Matchable<T[K]> | JestMatcher : T[K] | JestMatcher;
};

export function expectRes<T extends ApiResponse<any>>(res: T) {
  // 에러 메시지 포맷팅 헬퍼
  const formatMsg = (msg: string) => {
    const bodyStr = JSON.stringify(res.body, null, 2);
    return `${msg}\n----------------\n[Actual Response]\nStatus: ${res.status}\nBody: ${bodyStr}\n----------------`;
  };

  /**
   * 2xx 성공 응답을 검증합니다.
   * 검증에 성공하면 res.body를 반환하여 체이닝을 돕습니다.
   */
  const toBeApiOk = (expectedBody?: Matchable<SuccessBody<T>>): SuccessBody<T> => {
    // 1. Status Check
    if (res.status < 200 || res.status >= 300) {
      const error = new Error(
        formatMsg(
          `Expected Ok (2xx) but got ${res.status} ${
            (res.body as any)?.code ? `(${(res.body as any).code})` : ''
          }`,
        ),
      );
      Error.captureStackTrace(error, toBeApiOk);
      throw error;
    }

    // 2. Body Check
    if (expectedBody) {
      // ✅ Matcher가 섞여있어도 Jest의 toEqual은 내부적으로 잘 처리합니다.
      expect(res.body).toEqual(expectedBody);
    }

    // 반환은 다음 체이닝을 위해 원래의 엄격한 타입으로 반환
    return res.body as SuccessBody<T>;
  };

  /**
   * 특정 에러(Status, Code)를 검증합니다.
   */
  const toBeApiErr = (exception: ApiError) => {
    // 1. Status Check
    if (res.status !== exception.status) {
      const error = new Error(
        formatMsg(`Expected Err Status ${exception.status} but got ${res.status}`),
      );
      Error.captureStackTrace(error, toBeApiErr);
      throw error;
    }

    // 2. Error Code Check
    const code = (res.body as any)?.code;
    if (code !== exception.code) {
      const error = new Error(formatMsg(`Expected Err Code "${exception.code}" but got "${code}"`));
      Error.captureStackTrace(error, toBeApiErr);
      throw error;
    }
  };

  return {
    toBeApiOk,
    toBeApiErr,
  };
}
