import { expect } from '@jest/globals';

import { ApiError, ApiResponse } from '@workspace/contract'; // 사용하시는 경로에 맞춰주세요

// Jest 매처 확장
expect.extend({
  // 1. toBeApiOk 구현
  toBeApiOk(received: ApiResponse<any>, expectedBody?: any) {
    // 1-1. Status Code 체크 (200 ~ 299)
    const isStatusOk = received.status >= 200 && received.status < 300;

    // 1-2. Body 체크 (expectedBody가 있을 경우에만)
    const passBody = expectedBody ? this.equals(received.body, expectedBody) : true;

    const pass = isStatusOk && passBody;

    if (pass) {
      // .not.toBeApiOk()가 실패했을 때 메시지
      return {
        pass: true,
        message: () => `Expected response not to be OK (2xx), but got status ${received.status}`,
      };
    } else {
      // toBeApiOk()가 실패했을 때 메시지
      return {
        pass: false,
        message: () => {
          if (!isStatusOk) {
            return [
              `Expected status to be 2xx (Ok)`,
              `Expected: 2xx`,
              `Received: ${received.status}`,
              `Response Body: ${JSON.stringify(received.body, null, 2)}`,
            ].join('\n');
          }
          // Status는 성공인데 Body가 다를 경우 Diff 출력
          return (
            `Expected response body to match:\n` + this.utils.diff(expectedBody, received.body)
          );
        },
      };
    }
  },

  // 2. toBeApiErr 구현
  toBeApiErr(received: ApiResponse<any>, expectedError: ApiError) {
    const receivedStatus = received.status;
    const receivedCode = received.body?.code;

    const isStatusMatch = receivedStatus === expectedError.status;
    const isCodeMatch = receivedCode === expectedError.code;

    const pass = isStatusMatch && isCodeMatch;

    if (pass) {
      return {
        pass: true,
        message: () =>
          `Expected response not to be API Error ${expectedError.code} (${expectedError.status})`,
      };
    } else {
      return {
        pass: false,
        message: () => {
          const msg = [];
          if (!isStatusMatch) {
            msg.push(
              `Expected status: ${expectedError.status}`,
              `Received status: ${receivedStatus}`,
            );
          }
          if (!isCodeMatch) {
            msg.push(`Expected code: "${expectedError.code}"`, `Received code: "${receivedCode}"`);
          }
          // 디버깅을 위해 전체 바디 출력
          msg.push(`\nFull Body: ${JSON.stringify(received.body, null, 2)}`);

          return msg.join('\n');
        },
      };
    }
  },
});
