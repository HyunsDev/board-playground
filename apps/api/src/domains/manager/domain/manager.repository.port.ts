import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';

import { ManagerEntity } from './manager.entity';
import { ManagerNotFoundError } from './manager.errors';

export abstract class ManagerRepositoryPort extends RepositoryPort<ManagerEntity> {
  abstract getOneById(id: string): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract findAllByBoardSlug(boardSlug: string): Promise<ManagerEntity[]>;
  abstract findAllByUserId(userId: string): Promise<ManagerEntity[]>;
  abstract getOneByBoardIdAndUserId(
    boardId: string,
    userId: string,
  ): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract create(manager: ManagerEntity): Promise<DomainResult<ManagerEntity, never>>;
  abstract update(
    manager: ManagerEntity,
  ): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract delete(manager: ManagerEntity): Promise<DomainResult<void, ManagerNotFoundError>>;
}
