import { expect } from '@jest/globals';

import { ApiError, ApiResponse } from '@workspace/contract';

export function expectRes<T extends ApiResponse<any>>(res: T) {
  // 에러 메시지 포맷팅 헬퍼
  const formatMsg = (msg: string) =>
    `${msg}\n[Actual]: Status ${res.status} / Body ${JSON.stringify(res.body, null, 2)}`;

  return {
    toBeApiOk: (expectedBody?: any) => {
      if (res.status < 200 || res.status >= 300) {
        throw new Error(
          formatMsg(
            `Expected Ok (2xx) but got ${res.status} ${res.body?.code && `(${res.body.code})`}`,
          ),
        );
      }

      if (expectedBody) {
        // eslint-disable-next-line no-useless-catch
        try {
          expect(res.body).toEqual(expectedBody);
        } catch (e) {
          throw e; // Jest의 diff 출력을 유지하기 위해 re-throw
        }
      }
    },

    toBeApiErr: (exception: ApiError) => {
      if (res.status !== exception.status) {
        throw new Error(
          formatMsg(
            `Expected Err status ${exception.status} (${exception.code}) but got ${res.status} ${res.body?.code && `(${res.body.code})`}`,
          ),
        );
      }
      if (res.body?.code !== exception.code) {
        throw new Error(
          formatMsg(`Expected Err code "${exception.code}" but got "${res.body?.code}"`),
        );
      }
    },
  };
}
