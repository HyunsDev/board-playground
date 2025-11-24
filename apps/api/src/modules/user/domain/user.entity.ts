import { v7 as uuidv7 } from 'uuid';

import { USER_ROLE, USER_STATUS, UserRole, UserStatus } from '@workspace/contract';

import { UserCreatedEvent } from './events/user-created.event';

import { AggregateRoot, CommandMetadata } from '@/libs/ddd';

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
  passwordSalt: string;
}

export interface CreateUserProps {
  username: string;
  nickname: string;
  email: string;
  password: string;
  passwordSalt: string;
}

export class UserEntity extends AggregateRoot<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super({
      id: id || uuidv7(),
      props,
    });
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
      passwordSalt: createProps.passwordSalt,
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

  static reconstruct(props: UserProps, id: string): UserEntity {
    return new UserEntity(props, id);
  }

  public validate(): void {}
}
