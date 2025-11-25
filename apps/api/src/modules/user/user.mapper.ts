import { Injectable } from '@nestjs/common';

import { User, UserRole, UserStatus } from '@workspace/db';

import { UserEntity, UserProps } from './domain/user.entity';

import { BaseMapper } from '@/libs/ddd';

@Injectable()
export class UserMapper extends BaseMapper<UserEntity, User> {
  toDomain(record: User): UserEntity {
    const props: UserProps = {
      username: record.username,
      nickname: record.nickname,
      email: record.email,
      bio: record.bio,
      avatarUrl: record.avatarUrl,
      role: record.role,
      status: record.status,
      memo: record.memo,
      password: record.password,
      passwordSalt: record.passwordSalt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
    return UserEntity.reconstruct(props, record.id);
  }

  toPersistence(entity: UserEntity): User {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      email: props.email,
      bio: props.bio,
      avatarUrl: props.avatarUrl,
      role: props.role as UserRole,
      status: props.status as UserStatus,
      memo: props.memo,
      password: props.password,
      passwordSalt: props.passwordSalt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
