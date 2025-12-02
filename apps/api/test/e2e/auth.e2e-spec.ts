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
    const res = await client.api.auth.login({
      body: { email: user.email, password: user.password },
    });

    if (res.status !== 200) {
      throw new Error((res.body as any).code);
    }

    client.setAccessToken(res.body.accessToken);

    expect(res.status).toBe(200);
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
