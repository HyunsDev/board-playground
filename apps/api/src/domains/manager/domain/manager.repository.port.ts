import { DomainResultAsync, RepositoryPort } from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { BoardId, BoardSlug, ManagerId } from '@workspace/domain';

import { ManagerEntity } from './manager.entity';
import { ManagerNotFoundError } from './manager.errors';

export type FindOneManager =
  | {
      id: ManagerId;
      boardId?: BoardId;
      boardSlug?: BoardSlug;
      userId?: UserId;
    }
  | {
      id?: ManagerId;
      boardId: BoardId;
      boardSlug?: BoardSlug;
      userId: UserId;
    }
  | {
      id?: ManagerId;
      boardId?: BoardId;
      boardSlug: BoardSlug;
      userId: UserId;
    };

export type FindManyManagers =
  | {
      boardId: BoardId;

      boardSlug?: BoardSlug;
      userId?: UserId;
    }
  | {
      boardId?: BoardId;
      boardSlug?: BoardSlug;
      userId: UserId;
    }
  | {
      boardId?: BoardId;
      boardSlug: BoardSlug;
      userId?: UserId;
    };

export abstract class ManagerRepositoryPort extends RepositoryPort<ManagerEntity> {
  abstract getOne(params: FindOneManager): DomainResultAsync<ManagerEntity, ManagerNotFoundError>;
  abstract findOne(params: FindOneManager): DomainResultAsync<ManagerEntity | null, never>;
  abstract findMany(params: FindManyManagers): DomainResultAsync<ManagerEntity[], never>;
  abstract create(manager: ManagerEntity): DomainResultAsync<ManagerEntity, never>;
  abstract update(manager: ManagerEntity): DomainResultAsync<ManagerEntity, ManagerNotFoundError>;
  abstract delete(manager: ManagerEntity): DomainResultAsync<void, ManagerNotFoundError>;
}
