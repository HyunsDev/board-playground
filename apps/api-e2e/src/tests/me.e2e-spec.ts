import { faker } from '@faker-js/faker/.';
import { beforeAll, describe, it } from '@jest/globals';

import { TestUser } from '@/mocks/user.mock';
import { expectRes } from '@/utils/expect-res';
import { TestClient } from '@/utils/test-client';

describe('Me E2E', () => {
  let client: TestClient;
  let user: TestUser;

  beforeAll(async () => {
    user = new TestUser({});
    client = new TestClient();
    await client.registerAs(user);
  });

  it('내 정보 조회 (200)', async () => {
    const res = await client.api.user.me.get();
    expectRes(res).toBeApiOk({
      me: user.toMeExpectObject(),
    });
  });

  it('Profile 변경', async () => {
    const newNickname = faker.person.firstName();
    const newBio = faker.lorem.sentence();
    const res = await client.api.user.me.updateProfile({
      body: {
        nickname: newNickname,
        bio: newBio,
      },
    });

    expectRes(res).toBeApiOk({
      me: user.toMeExpectObject({
        bio: newBio,
        nickname: newNickname,
      }),
    });
    await client.syncUser(user);

    const meRes = await client.api.user.me.get();
    expectRes(meRes).toBeApiOk({
      me: user.toMeExpectObject({
        bio: newBio,
        nickname: newNickname,
      }),
    });
  });
});
