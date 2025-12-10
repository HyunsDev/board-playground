import { Query } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { DomainError, DomainResult } from '../error';
import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from './message-metadata.type';

export type AbstractIQuery<CausationCodeUnion extends string, T> = {
  readonly data: T;
  readonly metadata: AbstractCreateMessageMetadata<CausationCodeUnion>;
};

export type AbstractPaginatedQueryProps<CausationCodeUnion extends string, T> = AbstractIQuery<
  CausationCodeUnion,
  T & {
    page: number;
    take: number;
  }
>;

/**
 * BaseQuery는 모든 쿼리의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 쿼리는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 쿼리의 데이터와 메타데이터를 포함하는 타입
 * @template R - 쿼리 핸들러의 반환 타입
 * @template O - 쿼리 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseQuery<
  QueryCodeUnion extends CausationCodeUnion,
  QueryResourceTypeUnion extends string,
  CausationCodeUnion extends string,
  D extends AbstractIQuery<CausationCodeUnion, unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends Query<R> {
  public abstract readonly code: QueryCodeUnion;
  public abstract readonly resourceType: QueryResourceTypeUnion;

  readonly id: string;
  readonly resourceId: string | null;
  readonly data: D['data'];
  readonly metadata: AbstractMessageMetadata<CausationCodeUnion>;

  constructor(
    resourceId: string | null,
    data: D['data'],
    metadata: AbstractCreateMessageMetadata<CausationCodeUnion>,
  ) {
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
