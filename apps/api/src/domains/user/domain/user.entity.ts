import { v7 as uuidv7 } from 'uuid';

import { USER_ROLE, USER_STATUS, UserRole, UserStatus } from '@workspace/contract';

import { UserCreatedEvent } from './events/user-created.event';
import { UserAdminCannotBeDeletedException } from './user.exceptions';

import { AggregateRoot, CommandMetadata } from '@/shared/ddd';

export interface UserProps {
  username: string;
  nickname: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: UserStatus;
  memo: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProps {
  username: string;
  nickname: string;
  email: string;
  password: string;
}

export class UserEntity extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super({
      id: id || uuidv7(),
      props,
    });
  }

  get username(): string {
    return this.props.username;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get password(): string {
    return this.props.password;
  }

  public static create(createProps: CreateUserProps, metadata?: CommandMetadata): UserEntity {
    const id = uuidv7();
    const props: UserProps = {
      username: createProps.username,
      nickname: createProps.nickname,
      email: createProps.email,
      bio: null,
      avatarUrl: null,
      role: USER_ROLE.USER,
      status: USER_STATUS.ACTIVE,
      memo: null,
      password: createProps.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new UserEntity(props, id);

    user.addEvent(
      new UserCreatedEvent({
        aggregateId: id,
        email: props.email,
        username: props.username,
        nickname: props.nickname,
        metadata,
      }),
    );

    return user;
  }

  public updateProfile(data: {
    nickname?: string;
    bio?: string | null;
    avatarUrl?: string | null;
  }) {
    if (data.nickname !== undefined) {
      this.props.nickname = data.nickname;
    }
    if (data.bio !== undefined) {
      this.props.bio = data.bio;
    }
    if (data.avatarUrl !== undefined) {
      this.props.avatarUrl = data.avatarUrl;
    }
    this.props.updatedAt = new Date();
  }

  public validateDelete(): void {
    if (this.props.role === USER_ROLE.ADMIN) {
      throw new UserAdminCannotBeDeletedException();
    }
  }

  static reconstruct(props: UserProps, id: string): UserEntity {
    return new UserEntity(props, id);
  }

  public validate(): void {}
}
