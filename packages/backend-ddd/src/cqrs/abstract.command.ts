import { Command } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { DomainError, DomainResult } from '../error';
import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from './message-metadata.type';

export type AbstractICommand<CausationCodeType extends string, T> = {
  readonly data: T;
  readonly metadata: AbstractCreateMessageMetadata<CausationCodeType>;
  deriveMetadata(
    this: AbstractICommand<CausationCodeType, T>,
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCodeType>>,
  ): AbstractCreateMessageMetadata<CausationCodeType>;
};

/**
 * BaseCommand는 모든 커맨드의 공통 속성과 동작을 정의하는 추상 클래스입니다.
 * 각 커맨드는 이 클래스를 상속하여 고유한 데이터와 메타데이터를 가질 수 있습니다.
 * @template D - 커맨드의 데이터와 메타데이터를 포함하는 타입
 * @template R - 커맨드 핸들러의 반환 타입
 * @template O - 커맨드 핸들러가 성공적으로 처리했을 때 반환하는 값의 타입
 */
export abstract class AbstractCommand<
  CommandCodeType extends CausationCodeType,
  ResourceCodeType extends string,
  CausationCodeType extends string,
  D extends AbstractICommand<CausationCodeType, unknown>,
  R extends DomainResult<O, DomainError>,
  O,
> extends Command<R> {
  public abstract readonly code: CommandCodeType;
  public abstract readonly resourceType: ResourceCodeType;

  readonly id: string;
  public readonly resourceId: string | null;
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

  public deriveMetadata(
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

  public get streamId(): string {
    return `${this.resourceType}:${this.resourceId}`;
  }
}
