import { describe, beforeAll, it, expect } from '@jest/globals';
import * as cookie from 'cookie';

import { createTestClient } from '../utils/test-client';

interface MockUser {
  email: string;
  password: string;
  username: string;
  nickname: string;
}

interface userToken {
  accessToken: string;
  refreshToken: string;
}

describe('My Profile Flow', () => {
  let user: MockUser;
  let token: userToken;

  beforeAll(async () => {
    user = {
      email: 'example1@example.com',
      password: 'password123',
      username: 'exampleuser2',
      nickname: 'Example User 1',
    };
  });

  it('회원 가입', async () => {
    const anonClient = createTestClient();
    const registerRes = await anonClient.auth.register({
      body: {
        email: user.email,
        username: user.username,
        nickname: user.nickname,
        password: user.password,
      },
    });

    if (registerRes.status !== 200) {
      throw new Error((registerRes.body as any).code);
    }

    expect(registerRes.status).toBe(200);
  });

  it('로그인', async () => {
    const anonClient = createTestClient();
    const loginRes = await anonClient.auth.login({
      body: { email: user.email, password: user.password },
    });

    if (loginRes.status !== 200) {
      throw new Error((loginRes.body as any).code);
    }

    token = {
      accessToken: loginRes.body.accessToken,
      refreshToken: (cookie.parse(loginRes.headers.getSetCookie()[0]) as any).refreshToken,
    };

    expect(loginRes.status).toBe(200);
  });

  it('토큰 Refresh', async () => {
    const anonClient = createTestClient(token.accessToken);
    const res = await anonClient.auth.refreshToken({
      extraHeaders: {
        Cookie: `refreshToken=${token.refreshToken}`,
      },
    });

    if (res.status !== 200) {
      throw new Error((res.body as any).code);
    }

    expect(res.status).toBe(200);
  });

  it('로그아웃', async () => {
    const authClient = createTestClient(token.accessToken);
    const res = await authClient.auth.logout({});

    if (res.status !== 204) {
      console.log(res.body);
      throw new Error((res.body as any).code);
    }

    expect(res.status).toBe(204);
  });
});

//   beforeAll(async () => {
//     // 1. 로그인 요청
//     const anonClient = createTestClient();
//     const loginRes = await anonClient.auth.login({
//       body: { email: 'test@test.com', password: 'password' },
//     });

//     if (loginRes.status !== 200) {
//       if (loginRes.status === 400) {
//         throw new Error(loginRes.body.code);
//       }
//       throw new Error(loginRes.body as any);
//     }

//     // 2. 토큰을 주입하여 인증된 클라이언트 생성
//     const token = loginRes.body.accessToken;
//     client = createTestClient(token);
//   });

//   it('내 프로필 조회', async () => {
//     // 이제 헤더에 토큰이 자동으로 포함됨
//     const res = await client.user.me.get();

//     if (res.status !== 200) throw new Error('Failed to fetch profile');

//     expect(res.status).toBe(200);
//     // expect(res.body.user.).toBe('test@test.com');
//   });
// });
