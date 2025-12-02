import { Injectable } from '@nestjs/common';

import { UserDto, UserForAdminDto, UserSummaryDto } from '@workspace/contract';

import { UserEntity } from '../domain/user.entity';

import { BaseDtoMapper } from '@/shared/base';

@Injectable()
export class UserDtoMapper extends BaseDtoMapper<UserEntity, UserDto> {
  toDto(entity: UserEntity): UserDto {
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
    };
  }

  toSummaryDto(entity: UserEntity): UserSummaryDto {
    const props = entity.getProps();
    return {
      id: props.id,
      username: props.username,
      nickname: props.nickname,
      avatarUrl: props.avatarUrl,
    };
  }

  toUserForAdminDto(entity: UserEntity): UserForAdminDto {
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
      updatedAt: props.updatedAt.toISOString(),
      memo: props.memo,
    };
  }
}
