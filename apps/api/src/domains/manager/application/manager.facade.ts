import { Injectable } from '@nestjs/common';

import { matchError } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { MANAGER_ROLE } from '@workspace/contract';
import { BoardId, BoardSlug } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../domain';

@Injectable()
export class ManagerFacade {
  constructor(private readonly repo: ManagerRepositoryPort) {}

  async createMainManager(boardId: BoardId, userId: UserId) {
    const manager = ManagerEntity.createMainManager({ boardId, userId });
    return (await this.repo.create(manager)).match(
      (createdManager) => createdManager,
      (error) => matchError(error, {}),
    );
  }

  async listManagersByBoardSlug(boardSlug: BoardSlug): Promise<ManagerEntity[]> {
    return this.repo.findAllByBoardSlug(boardSlug);
  }

  async isUserManagerOfBoard(boardId: BoardId, userId: UserId): Promise<boolean> {
    const result = await this.repo.getOneByBoardIdAndUserId(boardId, userId);
    return result.isOk();
  }

  async isUserMainManagerOfBoard(boardId: BoardId, userId: UserId): Promise<boolean> {
    const result = await this.repo.getOneByBoardIdAndUserId(boardId, userId);
    return result.match(
      (manager) => manager.role === MANAGER_ROLE.MAIN_MANAGER,
      () => false,
    );
  }
}
