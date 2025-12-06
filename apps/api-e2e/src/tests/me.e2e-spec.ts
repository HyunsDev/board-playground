import { beforeAll, describe, expect, it } from '@jest/globals';

import { createMockUser, MockUser } from '@/mocks/user.mock';
import { TestClient } from '@/utils/test-client';

describe('Me E2E', () => {
  let client: TestClient;
  let user: MockUser;

  beforeAll(async () => {
    client = new TestClient();
    user = createMockUser();
    await client.api.devtools.resetDB();
    const res = await client.api.devtools.forceRegister({ body: { ...user } });
    if (res.status !== 200) throw new Error('Failed to register user in beforeAll');
    if (res.body.accessToken) client.setAccessToken(res.body.accessToken);
    if (res.body.refreshToken) client.setRefreshToken(res.body.refreshToken);
  });

  it('test', async () => {
    expect(1 + 1).toBe(2);
  });
});
