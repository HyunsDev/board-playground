import { Injectable } from '@nestjs/common';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import {
  DeletedAggregate,
  DomainResultAsync,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { Manager, PrismaClient } from '@workspace/database';

import {
  FindManyManagers,
  FindOneManager,
  ManagerEntity,
  ManagerNotFoundError,
  ManagerRepositoryPort,
} from '../domain';
import { ManagerMapper } from './manager.mapper';

@Injectable()
export class ManagerRepository
  extends BaseRepository<ManagerEntity, Manager, PrismaClient['manager']>
  implements ManagerRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: ManagerMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher);
  }

  protected get delegate(): PrismaClient['manager'] {
    return this.client.manager;
  }

  getOne(params: FindOneManager) {
    return this.getFirstEntity({
      where: {
        id: params.id,
        boardId: params.boardId,
        userId: params.userId,
        board: {
          slug: params.boardSlug,
        },
      },
    }).mapErr(() => new ManagerNotFoundError());
  }

  findOne(params: FindOneManager): DomainResultAsync<ManagerEntity | null, never> {
    return this.findFirstEntity({
      where: {
        id: params.id,
        boardId: params.boardId,
        userId: params.userId,
        board: {
          slug: params.boardSlug,
        },
      },
    });
  }

  findMany(params: FindManyManagers): DomainResultAsync<ManagerEntity[], never> {
    return this.findManyEntities({
      where: {
        boardId: params.boardId,
        userId: params.userId,
        board: {
          slug: params.boardSlug,
        },
      },
    });
  }

  create(manager: ManagerEntity) {
    return this.createEntity(manager).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  update(manager: ManagerEntity) {
    return this.updateEntity(manager).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new ManagerNotFoundError(),
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  delete(manager: DeletedAggregate<ManagerEntity>) {
    return this.deleteEntity(manager).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new ManagerNotFoundError(),
      }),
    );
  }
}
