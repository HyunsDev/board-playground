import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@workspace/backend-core';
import { User, UserRole, UserStatus } from '@workspace/database';

import { UserPasswordVO } from '../domain/user-password.vo';
import { UserEntity, UserProps } from '../domain/user.entity';

@Injectable()
export class UserMapper extends BaseMapper<UserEntity, User> {
  toDomain(record: User): UserEntity {
    const props: UserProps = {
      id: record.id,
      username: record.username,
      nickname: record.nickname,
      email: record.email,
      bio: record.bio,
      avatarUrl: record.avatarUrl,
      role: record.role,
      status: record.status,
      adminMemo: record.adminMemo,
      password: record.hashedPassword ? UserPasswordVO.fromHash(record.hashedPassword) : null,
      lastActiveAt: record.lastActiveAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      deletedAt: record.deletedAt,
    };
    return UserEntity.reconstruct(props);
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
      adminMemo: props.adminMemo,
      hashedPassword: props.password ? props.password.unpack() : null,
      lastActiveAt: props.lastActiveAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    };
  }
}
