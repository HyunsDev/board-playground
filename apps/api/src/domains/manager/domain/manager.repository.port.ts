import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { BoardId, BoardSlug, ManagerId } from '@workspace/domain';

import { ManagerEntity } from './manager.entity';
import { ManagerNotFoundError } from './manager.errors';

export abstract class ManagerRepositoryPort extends RepositoryPort<ManagerEntity> {
  abstract getOneById(id: ManagerId): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract findAllByBoardSlug(boardSlug: BoardSlug): Promise<ManagerEntity[]>;
  abstract findAllByUserId(userId: UserId): Promise<ManagerEntity[]>;
  abstract getOneByBoardSlugAndUserId(
    boardSlug: BoardSlug,
    userId: UserId,
  ): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract getOneByBoardIdAndUserId(
    boardId: BoardId,
    userId: UserId,
  ): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract create(manager: ManagerEntity): Promise<DomainResult<ManagerEntity, never>>;
  abstract update(
    manager: ManagerEntity,
  ): Promise<DomainResult<ManagerEntity, ManagerNotFoundError>>;
  abstract delete(manager: ManagerEntity): Promise<DomainResult<void, ManagerNotFoundError>>;
}
