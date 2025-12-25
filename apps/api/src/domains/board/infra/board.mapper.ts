import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@workspace/backend-core';
import { Board } from '@workspace/database';

import { BoardEntity } from '../domain';

@Injectable()
export class BoardMapper extends BaseMapper<BoardEntity, Board> {
  toDomain(record: Board): BoardEntity {
    return BoardEntity.reconstruct({
      id: record.id,
      slug: record.slug,
      name: record.name,
      description: record.description,
      managerId: record.managerId,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toPersistence(entity: BoardEntity): Board {
    const props = entity.getProps();
    return {
      id: props.id,
      slug: props.slug,
      name: props.name,
      description: props.description,
      managerId: props.managerId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
