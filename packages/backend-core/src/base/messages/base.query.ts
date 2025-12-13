import { Query } from '@nestjs/cqrs';
import { RESULT_TYPE_SYMBOL } from '@nestjs/cqrs/dist/classes/constants';

import {
  AbstractPaginatedQueryProps,
  AbstractQuery,
  AbstractQueryProps,
  DomainError,
  DomainResult,
} from '@workspace/backend-ddd';
import { PaginationQuery } from '@workspace/common';
import { CausationCode, DomainCode, QueryCode } from '@workspace/domain';

export type BaseQueryProps<T> = AbstractQueryProps<CausationCode, DomainCode, T>;
export type BasePaginatedQueryProps<T> = AbstractPaginatedQueryProps<
  CausationCode,
  DomainCode,
  PaginationQuery<T>
>;

/**
 * BaseQuery는 모든 쿼리의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 쿼리는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 쿼리의 데이터와 메타데이터를 포함하는 타입
 * @template R - 쿼리 핸들러의 반환 타입
 * @template O - 쿼리 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseQuery<
  TProps extends BaseQueryProps<unknown>,
  TOk,
  TRes extends DomainResult<TOk, DomainError>,
>
  extends AbstractQuery<CausationCode, DomainCode, QueryCode, TProps, TOk, TRes>
  implements Query<TRes>
{
  static readonly code: QueryCode;
  declare [RESULT_TYPE_SYMBOL]: TRes;
}
