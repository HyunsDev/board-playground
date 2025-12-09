import { faker } from '@faker-js/faker/.';
import { beforeAll, describe, it } from '@jest/globals';

import { ApiErrors } from '@workspace/contract';

import { TestUser } from '@/mocks/user.mock';
import { expectRes } from '@/utils/expect-res';
import { TestClient } from '@/utils/test-client';

describe('Me E2E', () => {
  let client: TestClient;
  let user: TestUser;
  let user2: TestUser;

  beforeAll(async () => {
    user = new TestUser({});
    user2 = new TestUser({});
    client = new TestClient();
    await client.registerAs(user);
    await client.registerAs(user2);
    await client.loginAs(user);
  });

  describe('내 정보 조회', () => {
    it('내 정보 조회 (200)', async () => {
      const res = await client.api.user.me.get();
      expectRes(res).toBeApiOk({
        me: user.toPrivateProfileExpectObject(),
      });
    });
  });

  describe('Profile 변경', () => {
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
        me: user.toPrivateProfileExpectObject({
          bio: newBio,
          nickname: newNickname,
        }),
      });
      await client.syncUser(user);

      const meRes = await client.api.user.me.get();
      expectRes(meRes).toBeApiOk({
        me: user.toPrivateProfileExpectObject({
          bio: newBio,
          nickname: newNickname,
        }),
      });
    });
  });

  describe('사용자 이름 변경', () => {
    it('사용자 이름 변경', async () => {
      const newUsername = faker.internet.username();
      const res = await client.api.user.me.updateUsername({
        body: {
          username: newUsername,
        },
      });

      expectRes(res).toBeApiOk({
        me: user.toPrivateProfileExpectObject({
          username: newUsername,
        }),
      });
      await client.syncUser(user);

      const meRes = await client.api.user.me.get();
      expectRes(meRes).toBeApiOk({
        me: user.toPrivateProfileExpectObject({
          username: newUsername,
        }),
      });
    });

    it('사용자 이름 중복으로 변경 실패 (409)', async () => {
      const res = await client.api.user.me.updateUsername({
        body: {
          username: user2.username,
        },
      });

      expectRes(res).toBeApiErr(ApiErrors.User.UsernameAlreadyExists);
    });
  });

  describe('회원 탈퇴', () => {
    it('회원 탈퇴', async () => {
      const res = await client.api.user.me.delete();
      expectRes(res).toBeApiOk();

      // 탈퇴 후 내 정보 조회 실패
      const meRes = await client.api.user.me.get();
      expectRes(meRes).toBeApiErr(ApiErrors.User.NotFound);
    });
  });
});
