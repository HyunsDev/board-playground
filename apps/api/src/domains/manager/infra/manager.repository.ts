import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { Manager, PrismaClient } from '@workspace/database';

import { ManagerEntity, ManagerNotFoundError, ManagerRepositoryPort } from '../domain';
import { ManagerMapper } from './manager.mapper';

@Injectable()
export class ManagerRepository
  extends BaseRepository<ManagerEntity, Manager>
  implements ManagerRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: ManagerMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher, new Logger(ManagerRepository.name));
  }

  protected get delegate(): PrismaClient['manager'] {
    return this.client.manager;
  }

  async getOneById(id: string) {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new ManagerNotFoundError());
    }
    return ok(result);
  }

  async findAllByBoardSlug(boardSlug: string): Promise<ManagerEntity[]> {
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

  async findAllByUserId(userId: string): Promise<ManagerEntity[]> {
    const records = await this.delegate.findMany({
      where: { userId },
      include: { board: true },
    });
    return records.map((record) => this.mapper.toDomain(record));
  }

  async getOneByBoardSlugAndUserId(boardSlug: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { slug: boardSlug },
      select: { id: true },
    });
    if (!board) {
      return err(new ManagerNotFoundError());
    }
    const boardId = board.id;

    return await this.getOneByBoardIdAndUserId(boardId, userId);
  }

  async getOneByBoardIdAndUserId(boardId: string, userId: string) {
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

  async delete(manager: ManagerEntity) {
    return (await this.deleteEntity(manager)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new ManagerNotFoundError()),
        }),
    );
  }
}
