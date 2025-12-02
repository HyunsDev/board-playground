import { describe, beforeAll, it, expect } from '@jest/globals';
import { createMockUser, MockUser } from '@test/mocks/user.mock';
import { TestClient } from '@test/utils/test-client';

describe('My Profile Flow', () => {
  let user: MockUser;
  let client: TestClient;

  beforeAll(async () => {
    client = new TestClient();
    user = createMockUser();
  });

  it('회원 가입', async () => {
    const res = await client.api.auth.register({
      body: { ...user },
    });

    if (res.status !== 200) {
      throw new Error((res.body as any).code);
    }

    expect(res.status).toBe(200);
  });

  it('로그인', async () => {
    const loginRes = await client.api.auth.login({
      body: { email: user.email, password: user.password },
    });

    if (loginRes.status !== 200) {
      throw new Error((loginRes.body as any).code);
    }

    client.setAccessToken(loginRes.body.accessToken);
    expect(loginRes.status).toBe(200);

    const meRes = await client.api.user.me.get();

    if (meRes.status !== 200) {
      throw new Error((meRes.body as any).code);
    }

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.username).toBe(user.username);
  });

  it('토큰 Refresh', async () => {
    const res = await client.api.auth.refreshToken();

    if (res.status !== 200) {
      throw new Error((res.body as any).code);
    }

    expect(res.status).toBe(200);
  });

  it('로그아웃', async () => {
    const res = await client.api.auth.logout();

    if (res.status !== 204) {
      console.log(res.body);
      throw new Error((res.body as any).code);
    }

    expect(res.status).toBe(204);
  });
});
