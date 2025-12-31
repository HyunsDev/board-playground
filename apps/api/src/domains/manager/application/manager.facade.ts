import { Injectable } from '@nestjs/common';

import { MANAGER_ROLE } from '@workspace/contract';
import { UserId } from '@workspace/domain';
import { BoardId, BoardSlug } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../domain';

@Injectable()
export class ManagerFacade {
  constructor(private readonly repo: ManagerRepositoryPort) {}

  createMainManager(boardId: BoardId, userId: UserId) {
    const manager = ManagerEntity.createMainManager({ boardId, userId });
    return this.repo.create(manager);
  }

  listManagersByBoardSlug(boardSlug: BoardSlug) {
    return this.repo.findMany({
      boardSlug,
    });
  }

  isUserManagerOfBoard(boardId: BoardId, userId: UserId) {
    return this.repo.getOne({
      boardId,
      userId,
    });
  }

  async isUserMainManagerOfBoard(boardId: BoardId, userId: UserId): Promise<boolean> {
    const result = await this.repo.getOne({
      boardId,
      userId,
    });
    return result.match(
      (manager) => manager.role === MANAGER_ROLE.MAIN_MANAGER,
      () => false,
    );
  }
}
