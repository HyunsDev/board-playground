import { Injectable } from '@nestjs/common';

import { matchError } from '@workspace/backend-ddd';

import { ManagerEntity, ManagerRepositoryPort } from '../domain';

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
}
