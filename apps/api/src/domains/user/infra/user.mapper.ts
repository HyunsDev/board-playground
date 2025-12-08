import { Injectable } from '@nestjs/common';

import { User, UserRole, UserStatus } from '@workspace/db';

import { UserPasswordVO } from '../domain/user-password.vo';
import { UserEntity, UserProps } from '../domain/user.entity';

import { BaseMapper } from '@/shared/base';

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
      password: record.hashedPassword ? UserPasswordVO.fromHash(record.hashedPassword) : null,
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
      hashedPassword: props.password ? props.password.unpack() : null,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
