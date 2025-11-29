import { v7 as uuidv7 } from 'uuid';

import { ArgumentNotProvidedException } from '../exceptions';

export type DomainEventMetadata = {
  /**
   * 이벤트 발생 시간
   */
  readonly timestamp: number;

  /**
   * 요청 추적 ID (Command의 correlationId를 이어받아야 함)
   */
  readonly correlationId: string;

  /**
   * 인과 관계 ID (보통 이 이벤트를 유발한 Command의 ID)
   */
  readonly causationId?: string;

  /**
   * 이벤트를 유발한 사용자 ID
   */
  readonly userId?: string;
};

export interface DomainEventProps {
  aggregateId: string;
  metadata?: Partial<DomainEventMetadata>;
}

export abstract class DomainEvent {
  public readonly id: string;

  /**
   * 이벤트가 발생한 애그리거트의 ID
   */
  public readonly aggregateId: string;

  public readonly metadata: DomainEventMetadata;

  constructor(props: DomainEventProps) {
    if (!props.aggregateId) {
      throw new ArgumentNotProvidedException('DomainEvent: aggregateId is required');
    }

    // UUID v7을 사용하고 싶다면 여기서 'uuid' 라이브러리를 사용하세요.
    // 여기서는 의존성을 줄이기 위해 Node.js 내장 crypto를 사용했습니다.
    this.id = uuidv7();
    this.aggregateId = props.aggregateId;

    this.metadata = {
      correlationId: props.metadata?.correlationId || uuidv7(),
      causationId: props.metadata?.causationId,
      userId: props.metadata?.userId,
      timestamp: props.metadata?.timestamp || Date.now(),
    };
  }
}
