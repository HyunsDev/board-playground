import { BaseDtoMapper } from '@workspace/backend-core';
import { InternalServerErrorException } from '@workspace/backend-ddd';
import { ManagerDto, ManagerWithBoardDto, ManagerWithUserDto } from '@workspace/contract';

import { ManagerEntity } from '../domain';

import { BoardDtoMapper } from '@/domains/board/interface/board.dto.mapper';
import { UserDtoMapper } from '@/domains/user/interface/user.dto-mapper';

export class ManagerDtoMapper extends BaseDtoMapper<ManagerEntity> {
  constructor(
    private readonly userDtoMapper: UserDtoMapper,
    private readonly boardDtoMapper: BoardDtoMapper,
  ) {
    super();
  }

  toDto(entity: ManagerEntity): ManagerDto {
    return {
      id: entity.id,
      boardId: entity.boardId,
      userId: entity.userId,
      role: entity.role,
      createdAt: entity.createdAt.toISOString(),
    };
  }

  toDtoWithUser(entity: ManagerEntity): ManagerWithUserDto {
    if (!entity.user) {
      throw new InternalServerErrorException('User data is missing in ManagerEntity');
    }

    return {
      ...this.toDto(entity),
      user: this.userDtoMapper.toSummaryDto(entity.user),
    };
  }

  toDtoWithUserMany(entities: ManagerEntity[]): ManagerWithUserDto[] {
    return this.mapMany(entities, this.toDtoWithUser);
  }

  toDtoWithBoard(entity: ManagerEntity): ManagerWithBoardDto {
    if (!entity.board) {
      throw new InternalServerErrorException('Board data is missing in ManagerEntity');
    }

    return {
      ...this.toDto(entity),
      board: this.boardDtoMapper.toDto(entity.board),
    };
  }

  toDtoWithBoardMany(entities: ManagerEntity[]): ManagerWithBoardDto[] {
    return this.mapMany(entities, this.toDtoWithBoard);
  }

  toDtoMany(entities: ManagerEntity[]): ManagerDto[] {
    return this.mapMany(entities, this.toDto);
  }
}
