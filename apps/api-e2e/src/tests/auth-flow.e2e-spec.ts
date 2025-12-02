import { describe, beforeAll, it, expect } from '@jest/globals';

import { EXCEPTION } from '@workspace/contract';

import { createMockUser, MockUser } from '@/mocks/user.mock';
import { TestClient } from '@/utils/test-client';
import { throwWithCode } from '@/utils/throw-with-code';

describe('Auth Flow', () => {
  let user: MockUser;
  let subUser: MockUser;
  let client: TestClient;

  let usedRefreshToken: string;
  let newRefreshToken: string;

  beforeAll(async () => {
    client = new TestClient();
    user = createMockUser();
    subUser = createMockUser();
  });

  it('회원가입: 정상 회원가입', async () => {
    const res = await client.api.auth.register({
      body: { ...user },
    });

    if (res.status !== 200) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(200);
  });

  it('회원가입: 중복 Email 확인', async () => {
    const res = await client.api.auth.register({
      body: { ...subUser, email: user.email },
    });

    if (res.status !== 409) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(EXCEPTION.USER.EMAIL_ALREADY_EXISTS.code);
  });

  it('회원가입: 중복 Username 확인', async () => {
    const res = await client.api.auth.register({
      body: { ...subUser, username: user.username },
    });

    if (res.status !== 409) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(409);
    expect(res.body.code).toBe(EXCEPTION.USER.USERNAME_ALREADY_EXISTS.code);
  });

  it('로그인: 존재하지 않는 이메일', async () => {
    const res = await client.api.auth.login({
      body: { email: 'nonexistent@example.com', password: '1q2w3e4r@' },
    });
    if (res.status !== 400) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(EXCEPTION.AUTH.INVALID_CREDENTIALS.code);
  });

  it('로그인: 잘못된 비밀번호', async () => {
    const res = await client.api.auth.login({
      body: { email: user.email, password: '1q2w3e4r@' },
    });

    if (res.status !== 400) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(EXCEPTION.AUTH.INVALID_CREDENTIALS.code);
  });

  it('로그인: 정상 로그인', async () => {
    const loginRes = await client.api.auth.login({
      body: { email: user.email, password: user.password },
    });

    if (loginRes.status !== 200) {
      throw throwWithCode(loginRes);
    }

    client.setAccessToken(loginRes.body.accessToken);
    expect(loginRes.status).toBe(200);

    const meRes = await client.api.user.me.get();

    if (meRes.status !== 200) {
      throw throwWithCode(meRes);
    }

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe(user.username);
  });

  it('토큰 갱신: 정상 갱신', async () => {
    usedRefreshToken = client.getRefreshToken();
    const res = await client.api.auth.refreshToken();

    if (res.status !== 200) {
      throw throwWithCode(res);
    }

    newRefreshToken = client.getRefreshToken();
    expect(newRefreshToken).not.toBe(usedRefreshToken);
    expect(res.status).toBe(200);
  });

  it('토큰 갱신: Access Token 미포함', async () => {
    client.clearAccessToken();
    const res = await client.api.auth.refreshToken();

    if (res.status !== 200) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(200);
  });

  it('토큰 갱신: 리프레시 토큰 재사용', async () => {
    client.setRefreshToken(usedRefreshToken);
    const res = await client.api.auth.refreshToken();

    if (res.status !== 400) {
      throw throwWithCode(res);
    }

    expect(res.status).toBe(400);
    expect(res.body.code).toBe(EXCEPTION.AUTH.USED_REFRESH_TOKEN.code);
    client.setRefreshToken(newRefreshToken);
  });

  it('로그아웃', async () => {
    const res = await client.api.auth.logout();

    if (res.status !== 204) {
      throw throwWithCode(res);
    }

    client.clearAuth();
    expect(res.status).toBe(204);
  });

  it('로그아웃 후 토큰 사용 불가 확인', async () => {
    const meRes = await client.api.user.me.get();

    if (meRes.status !== 401) {
      throw throwWithCode(meRes);
    }

    expect(meRes.status).toBe(401);
    expect(meRes.body.code).toBe(EXCEPTION.AUTH.MISSING_TOKEN.code);
  });
});
