import { Injectable } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import {
  DeletedAggregate,
  matchError,
  UnexpectedDomainErrorException,
} from '@workspace/backend-ddd';
import { UserId } from '@workspace/common';
import { Manager, PrismaClient } from '@workspace/database';
import { BoardId, BoardSlug, ManagerId } from '@workspace/domain';

import { ManagerEntity, ManagerNotFoundError, ManagerRepositoryPort } from '../domain';
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

  async getOneById(id: ManagerId) {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new ManagerNotFoundError());
    }
    return ok(result);
  }

  async findAllByBoardSlug(boardSlug: BoardSlug): Promise<ManagerEntity[]> {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
      select: { id: true },
    });
    if (!board) {
      return [];
    }
    const boardId = board.id;

    const records = await this.delegate.findMany({
      where: { boardId },
      include: { user: true },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  async findAllByUserId(userId: UserId): Promise<ManagerEntity[]> {
    const records = await this.delegate.findMany({
      where: { userId },
      include: { board: true },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  async getOneByBoardSlugAndUserId(boardSlug: BoardSlug, userId: UserId) {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
      select: { id: true },
    });
    if (!board) {
      return err(new ManagerNotFoundError());
    }
    const boardId = board.id as BoardId;

    return await this.getOneByBoardIdAndUserId(boardId, userId);
  }

  async getOneByBoardIdAndUserId(boardId: BoardId, userId: UserId) {
    const record = await this.delegate.findFirst({
      where: { boardId, userId },
    });
    if (!record) {
      return err(new ManagerNotFoundError());
    }
    return ok(this.mapper.toDomain(record));
  }

  async create(manager: ManagerEntity) {
    return (await this.createEntity(manager)).match(
      (createdManager) => ok(createdManager),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async update(manager: ManagerEntity) {
    return (await this.updateEntity(manager)).match(
      (updatedManager) => ok(updatedManager),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new ManagerNotFoundError()),
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async delete(manager: DeletedAggregate<ManagerEntity>) {
    return (await this.deleteEntity(manager)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new ManagerNotFoundError()),
        }),
    );
  }
}
