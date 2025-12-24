import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@workspace/backend-core';
import { Manager } from '@workspace/database';

import { ManagerEntity } from '../domain';

@Injectable()
export class ManagerMapper extends BaseMapper<ManagerEntity, Manager> {
  toDomain(record: Manager): ManagerEntity {
    return ManagerEntity.reconstruct({
      id: record.id,
      boardId: record.boardId,
      userId: record.userId,
      role: record.role,
      appointedById: record.appointedById,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
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
