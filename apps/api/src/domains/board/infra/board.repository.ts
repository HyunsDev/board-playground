import { Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';

import {
  BaseRepository,
  DomainEventPublisherPort,
  PrismaService,
  TransactionContext,
} from '@workspace/backend-core';
import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { createPaginatedResult } from '@workspace/common';
import { Board, PrismaClient } from '@workspace/database';

import {
  BoardEntity,
  BoardNotFoundError,
  BoardRepositoryPort,
  BoardSlugAlreadyExistsError,
  SearchBoardParams,
} from '../domain';
import { BoardMapper } from './board.mapper';

@Injectable()
export class BoardRepository
  extends BaseRepository<BoardEntity, Board>
  implements BoardRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: BoardMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher, new Logger(BoardRepository.name));
  }

  protected get delegate(): PrismaClient['board'] {
    return this.client.board;
  }

  async getOneById(id: string) {
    const result = await this.findOneById(id);
    if (!result) {
      return err(new BoardNotFoundError());
    }
    return ok(result);
  }

  async findOneBySlug(slug: string) {
    const record = await this.delegate.findUnique({
      where: { slug },
    });
    return record ? this.mapper.toDomain(record) : null;
  }

  async getOneBySlug(slug: string) {
    const record = await this.findOneBySlug(slug);
    if (!record) {
      return err(new BoardNotFoundError());
    }
    return ok(record);
  }

  async slugExists(slug: string) {
    const count = await this.delegate.count({
      where: { slug },
    });
    return count > 0;
  }

  async searchBoards({ name, slug, limit, page }: SearchBoardParams) {
    const where = {
      slug: slug ? { contains: slug } : undefined,
      name: name ? { contains: name } : undefined,
    };

    const [items, totalItem] = await Promise.all([
      this.delegate.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.delegate.count({ where }),
    ]);

    const entities = items.map((item) => this.mapper.toDomain(item));
    return createPaginatedResult({
      items: entities,
      totalItems: totalItem,
      options: {
        page,
        limit,
      },
    });
  }

  async create(entity: BoardEntity) {
    return (await this.createEntity(entity)).match(
      (board) => ok(board),
      (error) =>
        matchError(error, {
          EntityConflict: (e) => {
            if (e.details?.conflicts.some((conflict) => conflict.field === 'slug')) {
              return err(new BoardSlugAlreadyExistsError());
            }
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async update(board: BoardEntity) {
    return (await this.updateEntity(board)).match(
      (board) => ok(board),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new BoardNotFoundError()),
          EntityConflict: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
        }),
    );
  }

  async delete(board: BoardEntity) {
    return (await this.deleteEntity(board)).match(
      () => ok(undefined),
      (error) =>
        matchError(error, {
          EntityNotFound: () => err(new BoardNotFoundError()),
        }),
    );
  }
}
