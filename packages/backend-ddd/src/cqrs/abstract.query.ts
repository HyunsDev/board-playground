import { Query } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { DomainError, DomainResult } from '../error';
import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from './message-metadata.type';

export type AbstractIQuery<CausationCodeType extends string, T> = {
  readonly data: T;
  readonly metadata: AbstractCreateMessageMetadata<CausationCodeType>;
};

export type AbstractPaginatedQueryProps<CausationCodeType extends string, T> = AbstractIQuery<
  CausationCodeType,
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
export abstract class AbstractQuery<
  QueryCodeType extends CausationCodeType,
  QueryResourceCodeType extends string,
  CausationCodeType extends string,
  D extends AbstractIQuery<CausationCodeType, unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends Query<R> {
  public abstract readonly code: QueryCodeType;
  public abstract readonly resourceType: QueryResourceCodeType;

  readonly id: string;
  readonly resourceId: string | null;
  readonly data: D['data'];
  readonly metadata: AbstractMessageMetadata<CausationCodeType>;

  constructor(
    resourceId: string | null,
    data: D['data'],
    metadata: AbstractCreateMessageMetadata<CausationCodeType>,
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
