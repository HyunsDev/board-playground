import { faker } from '@faker-js/faker';
import { expect } from '@jest/globals';

import { UserEmail, Username } from '@workspace/common';
import { UserBaseDto, UserPrivateProfileDto, UserPublicProfileDto } from '@workspace/contract';

import { Matchable } from '@/utils/expect-res';

type TestUserLocalData = {
  password: string;
};

export const getTestUserName = () =>
  faker.internet.username().toLowerCase().replaceAll('-', '_') as Username;

export class TestUser {
  private _serverState: Partial<UserBaseDto> = {};
  private _localState: TestUserLocalData;

  constructor(init?: { server?: Partial<UserBaseDto>; local?: Partial<TestUserLocalData> }) {
    // 초기 더미 데이터 생성
    this._serverState = {
      email: faker.internet.email() as UserEmail,
      username: getTestUserName(),
      nickname: faker.person.firstName(),
      ...init?.server,
    };
    this._localState = {
      password: faker.internet.password(),
      ...init?.local,
    };
  }

  // --- Getters ---

  /** 서버에 저장된 유저인지 확인 (ID 존재 여부) */
  get isRegistered(): boolean {
    return !!this._serverState.id;
  }

  get email() {
    return this._serverState.email!;
  }
  get username() {
    return this._serverState.username!;
  }
  get nickname() {
    return this._serverState.nickname!;
  }
  get password() {
    return this._localState.password;
  }

  /** 현재 서버 상태의 스냅샷 반환 */
  get current() {
    return { ...this._serverState };
  }

  // --- Actions ---

  /** 서버 응답 데이터를 이 객체에 반영 (동기화) */
  bind(dto: Partial<UserBaseDto>) {
    this._serverState = { ...this._serverState, ...dto };
    return this;
  }

  /** 로컬 데이터를 수정 (테스트 시나리오용) */
  updateLocal(data: Partial<TestUserLocalData>) {
    this._localState = { ...this._localState, ...data };
    return this;
  }

  /** 회원가입 요청용 Body 생성 */
  toRegisterBody() {
    return {
      email: this.email,
      username: this.username,
      nickname: this.nickname,
      password: this.password,
    };
  }

  // --- Assertions ---

  toPrivateProfileExpectObject(
    overrides?: Partial<UserPrivateProfileDto>,
  ): Matchable<UserPrivateProfileDto> {
    if (!this.isRegistered) {
      throw new Error('Cannot create expect object for unregistered user');
    }

    return {
      id: this._serverState.id ?? expect.any(String),
      email: this.email,
      username: this.username,
      nickname: this.nickname,
      bio: this._serverState.bio ?? null,
      avatarUrl: this._serverState.avatarUrl ?? null,
      role: this._serverState.role ?? 'USER',
      status: this._serverState.status ?? 'ACTIVE',
      lastActiveAt: expect.any(String),
      createdAt: expect.any(String),
      deletedAt: this._serverState.deletedAt ? expect.any(String) : null,
      ...overrides,
    };
  }

  toPublicProfileExpectObject(
    overrides?: Partial<UserPublicProfileDto>,
  ): Matchable<UserPublicProfileDto> {
    if (!this.isRegistered) {
      throw new Error('Cannot create expect object for unregistered user');
    }

    return {
      id: this._serverState.id ?? expect.any(String),
      username: this.username,
      nickname: this.nickname,
      bio: this._serverState.bio ?? null,
      avatarUrl: this._serverState.avatarUrl ?? null,
      role: this._serverState.role ?? 'USER',
      status: this._serverState.status ?? 'ACTIVE',
      createdAt: expect.any(String),
      deletedAt: this._serverState.deletedAt ? expect.any(String) : null,
      ...overrides,
    };
  }
}
