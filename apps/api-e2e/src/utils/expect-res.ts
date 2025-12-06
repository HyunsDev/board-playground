import { expect } from '@jest/globals';

import { ApiError, ApiResponse } from '@workspace/contract';

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
  const toBeApiOk = <BodyType = any>(expectedBody?: BodyType): BodyType => {
    // 1. Status Check (2xx 범위)
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

    // 2. Body Check (값이 있을 경우에만)
    if (expectedBody) {
      expect(res.body).toEqual(expectedBody);
    }

    return res.body as BodyType;
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
