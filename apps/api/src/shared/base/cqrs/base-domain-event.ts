import { AbstractDomainEvent, AbstractIDomainEvent } from '@workspace/backend-ddd';
import { AggregateCode, CausationCode, EventCode } from '@workspace/domain';

export type BaseIDomainEvent<D> = AbstractIDomainEvent<CausationCode<string>, D>;

/**
 * BaseDomainEvent는 모든 도메인 이벤트의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 도메인 이벤트는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 도메인 이벤트의 데이터와 메타데이터를 포함하는 타입
 */
export abstract class BaseDomainEvent<
  D extends BaseIDomainEvent<unknown>,
> extends AbstractDomainEvent<EventCode<string>, AggregateCode, CausationCode<string>, D> {}
