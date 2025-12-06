import { ApiError } from '@workspace/contract';

declare global {
  namespace jest {
    interface Matchers<R> {
      /**
       * 응답 상태 코드가 2xx인지 확인하고,
       * 선택적으로 body가 expectedBody와 일치하는지 확인합니다.
       */
      toBeApiOk(expectedBody?: any): R;

      /**
       * 응답이 특정 ApiError(status code 및 error code)와 일치하는지 확인합니다.
       */
      toBeApiErr(expectedError: ApiError): R;
    }
  }
}

export {}; // 모듈로 인식되게 하기 위함
