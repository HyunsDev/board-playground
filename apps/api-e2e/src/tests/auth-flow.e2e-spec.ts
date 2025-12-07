import { describe, beforeAll, it, expect } from '@jest/globals';

import { ApiErrors } from '@workspace/contract';

import { createMockUser, MockUser } from '@/mocks/user.mock';
import { expectRes } from '@/utils/expect-res';
import { TestClient } from '@/utils/test-client';

describe('Auth Flow E2E', () => {
  let client: TestClient;

  // 비밀번호가 포함된 유저 타입 정의
  type UserWithPassword = MockUser & { password: string };
  let user: UserWithPassword;
  let subUser: UserWithPassword;

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

    // DB 초기화
    await client.api.devtools.resetDB();
  });

  describe('1. 회원가입 검증 (Validation)', () => {
    it('정상 회원가입 성공 (200)', async () => {
      const res = await client.api.auth.register({ body: { ...user } });
      expectRes(res).toBeApiOk();
    });

    it('이메일 중복 시 가입 실패 (409)', async () => {
      const res = await client.api.auth.register({
        body: { ...subUser, email: user.email },
      });

      expectRes(res).toBeApiErr(ApiErrors.User.EmailAlreadyExists);
    });

    it('Username 중복 시 가입 실패 (409)', async () => {
      const res = await client.api.auth.register({
        body: { ...subUser, username: user.username },
      });

      expectRes(res).toBeApiErr(ApiErrors.User.UsernameAlreadyExists);
    });
  });

  describe('2. 로그인 검증', () => {
    it('존재하지 않는 이메일로 로그인 시 실패 (400)', async () => {
      const res = await client.api.auth.login({
        body: { email: 'nonexistent@example.com', password: '1q2w3e4r!' },
      });

      expectRes(res).toBeApiErr(ApiErrors.Auth.InvalidCredentials);
    });

    it('잘못된 비밀번호로 로그인 시 실패 (400)', async () => {
      const res = await client.api.auth.login({
        body: { email: user.email, password: '1q2w3e4r#' },
      });

      expectRes(res).toBeApiErr(ApiErrors.Auth.InvalidCredentials);
    });
  });

  describe('3. 인증 시나리오 (Login -> Refresh -> Logout)', () => {
    it('정상 로그인 후 AccessToken 발급 및 저장 (200)', async () => {
      const res = await client.api.auth.login({
        body: { email: user.email, password: user.password },
      });

      // [개선] toBeApiOk가 body를 반환하므로 as any 없이 사용 가능
      // 응답 타입을 명시(<AuthResponse>)하면 더 안전함
      const body = expectRes(res).toBeApiOk();

      // 상태 저장
      client.setAccessToken(body.accessToken);
    });

    it('내 정보 조회 확인 (200)', async () => {
      const res = await client.api.user.me.get();

      expectRes(res).toBeApiOk({
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
      expectRes(res).toBeApiOk({
        accessToken: expect.any(String),
      });

      const newRefreshToken = client.getRefreshToken();
      expect(newRefreshToken).not.toBe(currentRefreshToken);
      expect(newRefreshToken).toBeDefined();
    });

    it('토큰 갱신: 이미 사용된 Refresh Token 사용 시 감지 (Reuse Detection)', async () => {
      // 1. 정상 갱신을 한 번 더 수행하여 "구 토큰"과 "신 토큰"을 생성
      const oldRefreshToken = client.getRefreshToken();

      const res1 = await client.api.auth.refreshToken();
      expectRes(res1).toBeApiOk({
        accessToken: expect.any(String),
      });

      const validRefreshToken = client.getRefreshToken();

      // 2. 이미 사용된(old) 토큰으로 재요청 -> Reuse Detected
      client.setRefreshToken(oldRefreshToken);
      const res2 = await client.api.auth.refreshToken();
      expectRes(res2).toBeApiErr(ApiErrors.Auth.RefreshTokenReuseDetected);

      // 3. Reuse 감지 후, 최신(valid) 토큰도 무효화(Revoked) 되었는지 확인
      client.setRefreshToken(validRefreshToken);
      const res3 = await client.api.auth.refreshToken();
      expectRes(res3).toBeApiErr(ApiErrors.Auth.SessionRevoked);
    });

    it('로그아웃 수행 (204)', async () => {
      const res = await client.api.auth.logout();
      expectRes(res).toBeApiOk();

      // 클라이언트 상태 초기화 확인
      client.clearAuth();
      expect(client.getRefreshToken()).toBeUndefined();
    });

    it('로그아웃 후 내 정보 조회 시 차단 확인 (401)', async () => {
      const res = await client.api.user.me.get();
      expectRes(res).toBeApiErr(ApiErrors.Auth.AccessTokenMissing);
    });
  });
});
