import { Query } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

export type QueryMetadata = {
  readonly correlationId: string;
  readonly causationId?: string;
  readonly userId?: string;
  readonly timestamp: number;
};

export type QueryProps<T> = Omit<T, keyof QueryBase> & Partial<QueryBase>;

export abstract class QueryBase<TRes = any> extends Query<TRes> {
  readonly id: string;
  readonly metadata: QueryMetadata;

  constructor(props?: QueryProps<QueryBase<TRes>>) {
    super();
    this.id = props?.id || uuidv7();

    this.metadata = {
      correlationId: props?.metadata?.correlationId || '',
      causationId: props?.metadata?.causationId,
      userId: props?.metadata?.userId,
      timestamp: props?.metadata?.timestamp || Date.now(),
    };
  }
}

export type PaginatedQueryProps<T> = QueryProps<T> & {
  readonly page?: number;
  readonly take?: number;
};

export abstract class PaginatedQueryBase<TRes> extends QueryBase<TRes> {
  readonly page: number;
  readonly take: number;

  constructor(props: PaginatedQueryProps<PaginatedQueryBase<TRes>>) {
    super(props);
    this.page = props.page ? Math.max(1, props.page) : 1;
    this.take = props.take ? Math.max(1, props.take) : 20;
  }
}
