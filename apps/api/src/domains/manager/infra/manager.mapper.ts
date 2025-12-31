import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@workspace/backend-core';
import { Manager, Prisma } from '@workspace/database';
import { UserId } from '@workspace/domain';
import { BoardId, ManagerId } from '@workspace/domain';

import { ManagerEntity, ManagerProps } from '../domain';

import { BoardMapper } from '@/domains/board/infra/board.mapper';
import { UserMapper } from '@/domains/user/infra/user.mapper';

export type ManagerWithBoard = Prisma.ManagerGetPayload<{
  include: { board: true };
}>;

export type ManagerWithUser = Prisma.ManagerGetPayload<{
  include: { user: true };
}>;

@Injectable()
export class ManagerMapper extends BaseMapper<ManagerEntity, Manager> {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly boardMapper: BoardMapper,
  ) {
    super();
  }

  toDomain(record: Manager | ManagerWithBoard | ManagerWithUser): ManagerEntity {
    const props: ManagerProps = {
      id: record.id as ManagerId,
      boardId: record.boardId as BoardId,
      userId: record.userId as UserId,
      role: record.role,
      appointedById: record.appointedById as UserId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      user: 'user' in record && record.user ? this.userMapper.toDomain(record.user) : undefined,
      board:
        'board' in record && record.board ? this.boardMapper.toDomain(record.board) : undefined,
    };
    return ManagerEntity.reconstruct(props);
  }

  toPersistence(entity: ManagerEntity): Manager {
    const props = entity.getProps();
    return {
      id: props.id,
      boardId: props.boardId,
      userId: props.userId,
      role: props.role,
      appointedById: props.appointedById,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
