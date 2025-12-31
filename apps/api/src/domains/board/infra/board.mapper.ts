import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@workspace/backend-core';
import { Board } from '@workspace/database';
import { UserId } from '@workspace/domain';
import { BoardId, BoardSlug } from '@workspace/domain';

import { BoardEntity } from '../domain';

@Injectable()
export class BoardMapper extends BaseMapper<BoardEntity, Board> {
  toDomain(record: Board): BoardEntity {
    return BoardEntity.reconstruct({
      id: record.id as BoardId,
      slug: record.slug as BoardSlug,
      name: record.name,
      description: record.description,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      creatorId: record.creatorId as UserId,
    });
  }

  toPersistence(entity: BoardEntity): Board {
    const props = entity.getProps();
    return {
      id: props.id,
      slug: props.slug,
      name: props.name,
      description: props.description,
      creatorId: props.creatorId,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}
