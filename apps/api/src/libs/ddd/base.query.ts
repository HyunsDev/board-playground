import { Query } from '@nestjs/cqrs';

import { OrderBy, PaginatedQueryParams } from './repository.port';

/**
 * Base class for regular queries
 */
export abstract class QueryBase<TRes> extends Query<TRes> {}

/**
 * Base class for paginated queries
 * RepositoryPort의 PaginatedQueryParams 인터페이스를 구현하거나 호환됩니다.
 */
export abstract class PaginatedQueryBase<TRes>
  extends QueryBase<TRes>
  implements PaginatedQueryParams
{
  readonly page: number;
  readonly take: number;
  readonly orderBy?: OrderBy;

  constructor(props: PaginatedQueryParams) {
    super();
    // 1-based paging이 일반적이므로 기본값 1, take 20 설정
    this.page = props.page ? Math.max(1, props.page) : 1;
    this.take = props.take ? Math.max(1, props.take) : 20;
    this.orderBy = props.orderBy;
  }
}

// Paginated query parameters
export type PaginatedParams<T> = Omit<T, 'page' | 'take' | 'orderBy'> &
  Partial<Omit<PaginatedQueryParams, 'take'>>;
