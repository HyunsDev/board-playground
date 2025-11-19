import { OrderBy, PaginatedQueryParams } from './repository.port';

/**
 * Base class for regular queries
 */
export abstract class QueryBase {}

/**
 * Base class for paginated queries
 */
export abstract class PaginatedQueryBase extends QueryBase {
  page: number;
  take: number;
  orderBy: OrderBy;

  constructor(props: PaginatedParams<PaginatedQueryBase>) {
    super();
    this.take = props.take || 20;
    this.page = props.page || 0;
    this.orderBy = props.orderBy || { field: true, param: 'desc' };
  }
}

// Paginated query parameters
export type PaginatedParams<T> = Omit<T, 'take' | 'orderBy' | 'page'> &
  Partial<PaginatedQueryParams>;
