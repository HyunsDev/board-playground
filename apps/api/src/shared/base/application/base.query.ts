import { Query } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { PaginationMeta } from '@workspace/contract';

import { DomainError } from '../error';
import { CreateMessageMetadata, MessageMetadata } from '../interface';

import { QueryCode } from '@/shared/codes/query.codes';
import { QueryResourceType } from '@/shared/codes/resource-type.codes';
import { DomainResult } from '@/shared/types/result.type';

export type IQuery<T> = {
  readonly data: T;
  readonly metadata: CreateMessageMetadata;
};

export type PaginatedQueryProps<T> = IQuery<
  T & {
    page: number;
    take: number;
  }
>;

export type PaginatedResult<T> = {
  items: T[];
  meta: Required<PaginationMeta>;
};

/**
 * BaseQuery는 모든 쿼리의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 쿼리는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 쿼리의 데이터와 메타데이터를 포함하는 타입
 * @template R - 쿼리 핸들러의 반환 타입
 * @template O - 쿼리 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseQuery<
  D extends IQuery<unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends Query<R> {
  public abstract readonly code: QueryCode;
  public abstract readonly resourceType: QueryResourceType;

  readonly id: string;
  readonly resourceId: string | null;
  readonly data: D['data'];
  readonly metadata: MessageMetadata;

  constructor(resourceId: string | null, data: D['data'], metadata: CreateMessageMetadata) {
    super();
    this.id = uuidv7();
    this.data = data;
    this.resourceId = resourceId;

    this.metadata = {
      correlationId: metadata.correlationId || '',
      causationId: metadata.causationId,
      causationType: metadata.causationType,
      userId: metadata.userId,
      createdAt: Date.now(),
    };
  }

  public get streamId(): string {
    return `${this.resourceType}:${this.resourceId}`;
  }
}
