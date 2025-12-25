import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery } from '@workspace/common';
import { BoardId, BoardSlug } from '@workspace/domain';

import { BoardNotFoundError, BoardSlugAlreadyExistsError } from './board.domain-errors';
import { BoardEntity } from './board.entity';

export type SearchBoardParams = PaginationQuery<{
  slug?: BoardSlug;
  name?: string;
}>;

export abstract class BoardRepositoryPort extends RepositoryPort<BoardEntity> {
  abstract getOneById(id: BoardId): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract findOneBySlug(slug: BoardSlug): Promise<BoardEntity | null>;
  abstract getOneBySlug(slug: BoardSlug): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract slugExists(slug: BoardSlug): Promise<boolean>;
  abstract searchBoards(params: SearchBoardParams): Promise<PaginatedResult<BoardEntity>>;
  abstract create(
    board: BoardEntity,
  ): Promise<DomainResult<BoardEntity, BoardSlugAlreadyExistsError>>;
  abstract update(board: BoardEntity): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract delete(board: BoardEntity): Promise<DomainResult<void, BoardNotFoundError>>;
}
