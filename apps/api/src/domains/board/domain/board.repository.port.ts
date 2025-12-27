import { DomainResultAsync, RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery } from '@workspace/common';
import { BoardId, BoardSlug } from '@workspace/domain';

import { BoardNotFoundError, BoardSlugAlreadyExistsError } from './board.domain-errors';
import { BoardEntity } from './board.entity';

export type SearchBoardParams = PaginationQuery<{
  slug?: BoardSlug;
  name?: string;
}>;

export abstract class BoardRepositoryPort extends RepositoryPort<BoardEntity> {
  abstract getOneById(id: BoardId): DomainResultAsync<BoardEntity, BoardNotFoundError>;
  abstract getOneBySlug(slug: BoardSlug): DomainResultAsync<BoardEntity, BoardNotFoundError>;
  abstract findOneBySlug(slug: BoardSlug): DomainResultAsync<BoardEntity | null, never>;
  abstract slugExists(slug: BoardSlug): DomainResultAsync<boolean, never>;
  abstract search(
    params: SearchBoardParams,
  ): DomainResultAsync<PaginatedResult<BoardEntity>, never>;
  abstract create(board: BoardEntity): DomainResultAsync<BoardEntity, BoardSlugAlreadyExistsError>;
  abstract update(board: BoardEntity): DomainResultAsync<BoardEntity, BoardNotFoundError>;
  abstract delete(board: BoardEntity): DomainResultAsync<void, BoardNotFoundError>;
}
