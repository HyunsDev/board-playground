import { expect } from '@jest/globals';

// 프로젝트에서 사용하는 Exception 정의에 맞춤
interface BusinessException {
  status: number;
  code: string;
}

interface BaseResponse {
  status: number;
  body: any;
}

export function expectRes<T extends BaseResponse>(res: T) {
  // 에러 메시지 포맷팅 헬퍼
  const formatMsg = (msg: string) =>
    `${msg}\n[Actual]: Status ${res.status} / Body ${JSON.stringify(res.body, null, 2)}`;

  return {
    /**
     * 성공(Ok) 상태를 검증합니다. (2xx 범위)
     * @param expectedBody (선택) 비교할 응답 바디 객체
     */
    toBeOk: (expectedBody?: any) => {
      // 1. Status가 200번대인지 확인
      if (res.status < 200 || res.status >= 300) {
        throw new Error(
          formatMsg(
            `Expected Ok (2xx) but got ${res.status} ${res.body?.code && `(${res.body.code})`}`,
          ),
        );
      }

      // 2. 바디 비교 (값이 있을 경우에만)
      if (expectedBody) {
        // eslint-disable-next-line no-useless-catch
        try {
          expect(res.body).toEqual(expectedBody);
        } catch (e) {
          throw e; // Jest의 diff 출력을 유지하기 위해 re-throw
        }
      }
    },

    /**
     * 실패(Err) 상태를 검증합니다.
     * @param exception 정의된 예외 객체 (EXCEPTION.XXX)
     */
    toBeErr: (exception: BusinessException) => {
      // 1. Status 확인
      if (res.status !== exception.status) {
        throw new Error(
          formatMsg(
            `Expected Err status ${exception.status} (${exception.code}) but got ${res.status} ${res.body?.code && `(${res.body.code})`}`,
          ),
        );
      }

      // 2. Error Code 확인
      if (res.body?.code !== exception.code) {
        throw new Error(
          formatMsg(`Expected Err code "${exception.code}" but got "${res.body?.code}"`),
        );
      }
    },
  };
}
