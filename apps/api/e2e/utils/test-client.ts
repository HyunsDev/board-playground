// libs/e2e-client/src/test-client-factory.ts
import { initClient } from '@ts-rest/core';

import { contract } from '@workspace/contract';

// 환경 변수나 기본값으로 API URL 설정
const BASE_URL = process.env.API_URL || 'http://localhost:4000';

/**
 * 테스트용 클라이언트를 생성하는 팩토리 함수입니다.
 * 인증 토큰을 선택적으로 주입받아 인증된 클라이언트를 쉽게 반환합니다.
 */
export const createTestClient = (accessToken?: string) => {
  return initClient(contract, {
    baseUrl: BASE_URL,
    baseHeaders: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });
};

export type TestClient = ReturnType<typeof createTestClient>;
