import { err, ok } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

import { BaseAggregateRoot, BaseEntityProps } from '@workspace/backend-core';
import { UserEmail, UserId, Username } from '@workspace/common';
import { USER_ROLE, USER_STATUS, UserRole, UserStatus } from '@workspace/contract';

import { UserPasswordChangedEvent } from './events';
import { UserCreatedEvent } from './events/user-created.event';
import { UserUsernameChangedEvent } from './events/user-username-changed.event';
import { UserPasswordVO } from './user-password.vo';
import { UserAdminCannotBeDeletedError } from './user.domain-errors';

export interface UserProps extends BaseEntityProps<UserId> {
  username: Username;
  nickname: string;
  email: UserEmail;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  adminMemo: string | null;
  password: UserPasswordVO | null;
  lastActiveAt: Date;
  deletedAt: Date | null;
}

export interface CreateUserProps {
  username: Username;
  nickname: string;
  email: UserEmail;
  hashedPassword: string | null;
}

export class UserEntity extends BaseAggregateRoot<UserProps, UserId> {
  private constructor(props: UserProps) {
    super({
      id: props.id || (uuidv7() as UserId),
      props,
    });
  }

  get username(): Username {
    return this.props.username;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get email(): UserEmail {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get password(): UserPasswordVO | null {
    return this.props.password;
  }

  public static create(createProps: CreateUserProps): UserEntity {
    const id = uuidv7() as UserId;
    const props: UserProps = {
      id,
      username: createProps.username,
      nickname: createProps.nickname,
      email: createProps.email,
      bio: null,
      avatarUrl: null,
      role: USER_ROLE.USER,
      status: USER_STATUS.ACTIVE,
      password: createProps.hashedPassword
        ? UserPasswordVO.fromHash(createProps.hashedPassword)
        : null,
      adminMemo: null,
      lastActiveAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const user = new UserEntity(props);

    user.addEvent(
      new UserCreatedEvent({
        userId: id,
        email: props.email,
        username: props.username,
        nickname: props.nickname,
      }),
    );

    return user;
  }

  public updateProfile(data: { nickname?: string; bio?: string | null }) {
    if (data.nickname !== undefined) {
      this.props.nickname = data.nickname;
    }
    if (data.bio !== undefined) {
      this.props.bio = data.bio;
    }
    this.props.updatedAt = new Date();
  }

  public updateUsername(username: Username) {
    this.props.username = username;
    this.props.updatedAt = new Date();

    this.addEvent(
      new UserUsernameChangedEvent({
        userId: this.id,
        oldUsername: this.props.username,
        newUsername: username,
      }),
    );
  }

  public changePassword(newHashedPassword: string) {
    this.props.password = UserPasswordVO.fromHash(newHashedPassword);
    this.props.updatedAt = new Date();

    this.addEvent(
      new UserPasswordChangedEvent({
        userEmail: this.email,
        userId: this.id,
      }),
    );
  }

  public validateDelete() {
    if (this.props.role === USER_ROLE.ADMIN) {
      return err(new UserAdminCannotBeDeletedError());
    }
    return ok();
  }

  static reconstruct(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  public validate(): void {}
}
