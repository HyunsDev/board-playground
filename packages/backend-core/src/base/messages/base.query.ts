import {
  AbstractIPaginatedQuery,
  AbstractIQuery,
  AbstractQuery,
  DomainError,
  DomainResult,
} from '@workspace/backend-ddd';
import { CausationCode, QueryCode } from '@workspace/domain';

export type BaseIQuery<T> = AbstractIQuery<CausationCode<string>, T>;
export type BaseIPaginatedQuery<T> = AbstractIPaginatedQuery<CausationCode<string>, T>;

/**
 * BaseQuery는 모든 쿼리의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 쿼리는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 쿼리의 데이터와 메타데이터를 포함하는 타입
 * @template R - 쿼리 핸들러의 반환 타입
 * @template O - 쿼리 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseQuery<
  D extends BaseIQuery<unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends AbstractQuery<QueryCode<string>, string, CausationCode<string>, D, R, O> {}
