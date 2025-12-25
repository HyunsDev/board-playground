import { Injectable } from '@nestjs/common';

import { BaseDtoMapper } from '@workspace/backend-core';
import { BoardDto } from '@workspace/contract';

import { BoardEntity } from '../domain';

@Injectable()
export class BoardDtoMapper extends BaseDtoMapper<BoardEntity> {
  toDto(entity: BoardEntity): BoardDto {
    return {
      id: entity.id,
      slug: entity.slug,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt.toISOString(),
      managerId: entity.getProps().managerId,
    };
  }
}
