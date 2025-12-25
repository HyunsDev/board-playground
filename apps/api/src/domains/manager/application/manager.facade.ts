import { Injectable } from '@nestjs/common';

import { matchError } from '@workspace/backend-ddd';

import { ManagerEntity, ManagerRepositoryPort } from '../domain';
import { MANAGER_ROLE } from '@workspace/contract';

@Injectable()
export class ManagerFacade {
  constructor(private readonly repo: ManagerRepositoryPort) {}

  async createMainManager(boardId: string, userId: string) {
    const manager = ManagerEntity.createMainManager({ boardId, userId });
    return (await this.repo.create(manager)).match(
      (createdManager) => createdManager,
      (error) => matchError(error, {}),
    );
  }

  async listManagersByBoardSlug(boardSlug: string): Promise<ManagerEntity[]> {
    return this.repo.findAllByBoardSlug(boardSlug);
  }

  async isUserManagerOfBoard(boardId: string, userId: string): Promise<boolean> {
    const result = await this.repo.getOneByBoardIdAndUserId(boardId, userId);
    return result.isOk();
  }

  async isUserMainManagerOfBoard(boardId: string, userId: string): Promise<boolean> {
    const result = await this.repo.getOneByBoardIdAndUserId(boardId, userId);
    return result.match(
      (manager) => manager.role === MANAGER_ROLE.MAIN_MANAGER,
      () => false,
    );
  }
}
