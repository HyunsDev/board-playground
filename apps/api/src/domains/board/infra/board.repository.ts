import { Injectable } from '@nestjs/common';

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
  extends BaseRepository<BoardEntity, Board, PrismaClient['board']>
  implements BoardRepositoryPort
{
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly txContext: TransactionContext,
    protected readonly mapper: BoardMapper,
    protected readonly eventDispatcher: DomainEventPublisherPort,
  ) {
    super(prisma, txContext, mapper, eventDispatcher);
  }

  protected get delegate(): PrismaClient['board'] {
    return this.client.board;
  }

  getOneById(id: string) {
    return this.getUniqueEntity({
      where: { id },
    }).mapErr(() => new BoardNotFoundError());
  }

  findOneBySlug(slug: string) {
    return this.findUniqueEntity({
      where: { slug },
    });
  }

  getOneBySlug(slug: string) {
    return this.getUniqueEntity({
      where: { slug },
    }).mapErr(() => new BoardNotFoundError());
  }

  slugExists(slug: string) {
    return this.existsEntity({
      where: { slug },
    });
  }

  search(params: SearchBoardParams) {
    return this.findManyPaginatedEntities(params, {
      where: {
        slug: params.slug ? { contains: params.slug } : undefined,
        name: params.name ? { contains: params.name } : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(entity: BoardEntity) {
    return this.createEntity(entity).mapErr((error) =>
      matchError(error, {
        EntityConflict: (e) => {
          if (e.details?.conflicts.some((conflict) => conflict.field === 'slug')) {
            return new BoardSlugAlreadyExistsError();
          }
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  update(board: BoardEntity) {
    return this.updateEntity(board).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new BoardNotFoundError(),
        EntityConflict: (e) => {
          throw new UnexpectedDomainErrorException(e);
        },
      }),
    );
  }

  delete(board: DeletedAggregate<BoardEntity>) {
    return this.deleteEntity(board).mapErr((error) =>
      matchError(error, {
        EntityNotFound: () => new BoardNotFoundError(),
      }),
    );
  }
}
