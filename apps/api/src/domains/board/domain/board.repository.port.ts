import { RepositoryPort } from '@workspace/backend-ddd';
import { PaginatedResult, PaginationQuery } from '@workspace/common';

import { BoardEntity } from './board.entity';

export type SearchBoardParams = PaginationQuery<{
  slug?: string;
  name?: string;
}>;

export abstract class BoardRepositoryPort extends RepositoryPort<BoardEntity> {
  abstract findOneBySlug(slug: string): Promise<BoardEntity | null>;
  abstract slugExists(slug: string): Promise<boolean>;
  abstract searchBoards(params: SearchBoardParams): Promise<PaginatedResult<BoardEntity>>;
  abstract create(board: BoardEntity): Promise<BoardEntity>;
  abstract update(board: BoardEntity): Promise<BoardEntity>;
  abstract delete(board: BoardEntity): Promise<void>;
}
