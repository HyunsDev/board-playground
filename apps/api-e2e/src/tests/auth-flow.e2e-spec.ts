/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { describe, beforeAll, it, expect } from '@jest/globals';

import { ApiErrors } from '@workspace/contract';

import { createMockUser, MockUser } from '@/mocks/user.mock';
import { TestClient } from '@/utils/test-client';

describe('Auth Flow E2E', () => {
  let client: TestClient;
  let user: MockUser & { password: string };
  let subUser: MockUser & { password: string };

  // 전체 테스트 스위트에서 한 번만 실행
  beforeAll(async () => {
    client = new TestClient();
    user = {
      ...createMockUser(),
      password: '1q2w3e4r!',
    };
    subUser = {
      ...createMockUser(),
      password: '1q2w3e4r@',
    };
    await client.api.devtools.resetDB();
  });

  describe('1. 회원가입 검증 (Validation)', () => {
    // 성공 케이스가 먼저 있어야 중복 검사가 가능하므로 배치
    it('정상 회원가입 성공 (200)', async () => {
      const res = await client.api.auth.register({ body: { ...user } });
      expect(res).toBeApiOk();
    });

    it('이메일 중복 시 가입 실패 (409)', async () => {
      const res = await client.api.auth.register({
        body: { ...subUser, email: user.email }, // user의 이메일 재사용
      });

      expect(res).toBeApiErr(ApiErrors.User.EmailAlreadyExists);
    });

    it('Username 중복 시 가입 실패 (409)', async () => {
      const res = await client.api.auth.register({
        body: { ...subUser, username: user.username },
      });

      expect(res).toBeApiErr(ApiErrors.User.UsernameAlreadyExists);
    });
  });

  describe('2. 로그인 검증', () => {
    it('존재하지 않는 이메일로 로그인 시 실패 (400)', async () => {
      const res = await client.api.auth.login({
        body: { email: 'nonexistent@example.com', password: '1q2w3e4r!' },
      });

      expect(res).toBeApiErr(ApiErrors.Auth.InvalidCredentials);
    });

    it('잘못된 비밀번호로 로그인 시 실패 (400)', async () => {
      const res = await client.api.auth.login({
        body: { email: user.email, password: '1q2w3e4r@' },
      });

      expect(res).toBeApiErr(ApiErrors.Auth.InvalidCredentials);
    });
  });

  describe('3. 인증 시나리오 (Login -> Refresh -> Logout)', () => {
    it('정상 로그인 후 AccessToken 발급 (200)', async () => {
      const res = await client.api.auth.login({
        body: { email: user.email, password: user.password },
      });

      expect(res).toBeApiOk();

      // 상태 저장 (다음 테스트를 위해)
      client.setAccessToken((res.body as any).accessToken);
    });

    it('내 정보 조회 확인 (200)', async () => {
      const res = await client.api.user.me.get();

      expect(res).toBeApiOk({
        me: {
          id: expect.any(String),
          email: user.email,
          username: user.username,
          nickname: user.nickname,
          bio: null,
          avatarUrl: null,
          role: 'USER',
          status: 'ACTIVE',
          createdAt: expect.any(String),
        },
      });
    });

    it('토큰 갱신: 정상 갱신 확인 (200)', async () => {
      const currentRefreshToken = client.getRefreshToken();
      const res = await client.api.auth.refreshToken();

      expect(res).toBeApiOk();

      const newRefreshToken = client.getRefreshToken();
      expect(newRefreshToken).not.toBe(currentRefreshToken);
    });

    it('토큰 갱신: 이미 사용된 Refresh Token 사용 시 감지 (Reuse Detection)', async () => {
      const currentRefreshToken = client.getRefreshToken();

      const res1 = await client.api.auth.refreshToken();
      expect(res1).toBeApiOk();
      const newRefreshToken = client.getRefreshToken();

      // 이전 토큰 재사용 시도
      client.setRefreshToken(currentRefreshToken);
      const res2 = await client.api.auth.refreshToken();
      expect(res2).toBeApiErr(ApiErrors.Auth.RefreshTokenReuseDetected);

      // 세션 Revoke 확인
      client.setRefreshToken(newRefreshToken);
      const res3 = await client.api.auth.refreshToken();
      expect(res3).toBeApiErr(ApiErrors.Auth.SessionRevoked);
    });

    it('로그아웃 수행 (204)', async () => {
      const res = await client.api.auth.logout();
      expect(res).toBeApiOk();

      client.clearAuth();
      const currentRefreshToken = client.getRefreshToken();
      expect(currentRefreshToken).toBeUndefined();
    });

    it('로그아웃 후 내 정보 조회 시 차단 확인 (401)', async () => {
      const res = await client.api.user.me.get();

      expect(res).toBeApiErr(ApiErrors.Auth.AccessTokenMissing);
    });
  });
});
