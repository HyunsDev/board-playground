import { JobsOptions } from 'bullmq';
import { v7 } from 'uuid';

import {
  AbstractCreateMessageMetadata,
  AbstractMessageMetadata,
} from './abstract-message-metadata.type';

export type AbstractIJob<CausationCode extends string, T> = {
  readonly data: T;
  readonly metadata: AbstractCreateMessageMetadata<CausationCode>;
  driveMetadata(
    this: AbstractIJob<CausationCode, T>,
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCode>>,
  ): AbstractCreateMessageMetadata<CausationCode>;
};

/**
 * BaseJob는 모든 잡의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 잡은 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 잡의 데이터와 메타데이터를 포함하는 타입
 * @template R - 잡 핸들러의 반환 타입
 * @template O - 잡 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class AbstractJob<
  JobCodeType extends CausationCodeType,
  QueueCodeType extends string,
  ResourceCodeType extends string,
  CausationCodeType extends string,
  D extends AbstractIJob<CausationCodeType, unknown>,
> {
  abstract readonly code: JobCodeType;
  abstract readonly resourceType: ResourceCodeType;
  abstract readonly queueName: QueueCodeType;

  readonly id: string;
  readonly resourceId: string | null;
  readonly data: D['data'];
  metadata: AbstractMessageMetadata<CausationCodeType>;

  readonly jobsOptions?: JobsOptions;

  constructor(
    resourceId: string | null,
    data: D['data'],
    metadata: AbstractCreateMessageMetadata<CausationCodeType>,
    jobsOptions?: JobsOptions,
  ) {
    this.id = v7();
    this.data = data;
    this.resourceId = resourceId;
    this.jobsOptions = {
      jobId: this.id,
      removeOnComplete: true,
      ...jobsOptions,
    };

    this.metadata = {
      correlationId: metadata.correlationId || '',
      causationId: metadata.causationId,
      causationType: metadata.causationType,
      userId: metadata.userId,
      createdAt: Date.now(),
    };
  }

  setMetadata(metadata: AbstractCreateMessageMetadata<CausationCodeType>): void {
    this.metadata = {
      ...this.metadata,
      ...metadata,
      correlationId: metadata.correlationId || this.metadata.correlationId,
    };
  }

  deriveMetadata(
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCodeType>>,
  ): AbstractCreateMessageMetadata<CausationCodeType> {
    return {
      correlationId: this.metadata.correlationId, // 뿌리 유지
      causationId: this.id,
      causationType: this.code,
      userId: overrides?.userId ?? this.metadata.userId, // 행위자 유지 (필요 시 변경 가능)
      ...overrides,
    };
  }

  get streamId(): string {
    return `${this.resourceType}:${this.resourceId}`;
  }
}
