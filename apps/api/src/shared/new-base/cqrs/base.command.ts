import {
  AbstractCommand,
  AbstractICommand,
  DomainError,
  DomainResult,
} from '@workspace/backend-ddd';
import { AggregateCode, CausationCode } from '@workspace/domain';

export type BaseICommand<T> = AbstractICommand<CausationCode<string>, T>;

/**
 * BaseCommand는 모든 커맨드의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 커맨드는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 커맨드의 데이터와 메타데이터를 포함하는 타입
 * @template R - 커맨드 핸들러의 반환 타입
 * @template O - 커맨드 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class BaseCommand<
  D extends BaseICommand<unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends AbstractCommand<CausationCode<string>, AggregateCode, CausationCode<string>, D, R, O> {}
