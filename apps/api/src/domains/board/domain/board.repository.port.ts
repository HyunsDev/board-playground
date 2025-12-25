import { DomainResult, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery } from '@workspace/common';

import { BoardNotFoundError, BoardSlugAlreadyExistsError } from './board.domain-errors';
import { BoardEntity } from './board.entity';

export type SearchBoardParams = PaginationQuery<{
  slug?: string;
  name?: string;
}>;

export abstract class BoardRepositoryPort extends RepositoryPort<BoardEntity> {
  abstract getOneById(id: string): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract findOneBySlug(slug: string): Promise<BoardEntity | null>;
  abstract getOneBySlug(slug: string): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract slugExists(slug: string): Promise<boolean>;
  abstract searchBoards(params: SearchBoardParams): Promise<PaginatedResult<BoardEntity>>;
  abstract create(
    board: BoardEntity,
  ): Promise<DomainResult<BoardEntity, BoardSlugAlreadyExistsError>>;
  abstract update(board: BoardEntity): Promise<DomainResult<BoardEntity, BoardNotFoundError>>;
  abstract delete(board: BoardEntity): Promise<DomainResult<void, BoardNotFoundError>>;
}
