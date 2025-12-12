import { Injectable } from '@nestjs/common';

import { PaginationMetadata } from '@workspace/common';
import {
  UserPublicProfileDto,
  UserAdminDto,
  UserPrivateProfileDto,
  UserSummaryDto,
} from '@workspace/contract';

import { UserEntity } from '../domain/user.entity';

import { BaseDtoMapper } from '@/shared/base';

@Injectable()
export class UserDtoMapper extends BaseDtoMapper<UserEntity> {
  toPublicProfileDto(entity: UserEntity): UserPublicProfileDto {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      bio: props.bio,
      avatarUrl: props.avatarUrl,
      role: props.role,
      status: props.status,
      createdAt: props.createdAt.toISOString(),
      deletedAt: props.deletedAt?.toISOString() || null,
    };
  }

  toPaginatedPublicProfileDto(
    entities: UserEntity[],
    meta: PaginationMetadata,
  ): { items: UserPublicProfileDto[]; meta: PaginationMetadata } {
    return this.mapPaginated(entities, meta, (item) => this.toPublicProfileDto(item));
  }

  toPrivateProfileDto(entity: UserEntity): UserPrivateProfileDto {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      bio: props.bio,
      avatarUrl: props.avatarUrl,
      role: props.role,
      status: props.status,
      lastActiveAt: props.lastActiveAt?.toISOString(),
      createdAt: props.createdAt.toISOString(),
      deletedAt: props.deletedAt?.toISOString() || null,
      email: props.email,
    };
  }

  toSummaryDto(entity: UserEntity): UserSummaryDto {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      avatarUrl: props.avatarUrl,
      role: props.role,
    };
  }

  toUserAdminDto(entity: UserEntity): UserAdminDto {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      bio: props.bio,
      avatarUrl: props.avatarUrl,
      role: props.role,
      status: props.status,
      createdAt: props.createdAt.toISOString(),
      email: props.email,
      lastActiveAt: props.lastActiveAt?.toISOString(),
      updatedAt: props.updatedAt.toISOString(),
      deletedAt: props.deletedAt?.toISOString() || null,
      adminMemo: props.adminMemo,
    };
  }
}
