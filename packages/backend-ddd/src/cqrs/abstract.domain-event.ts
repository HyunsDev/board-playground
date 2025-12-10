import { IEvent } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';
import { AbstractCreateMessageMetadata, AbstractMessageMetadata } from './message-metadata.type';

export interface IAbstractDomainEvent<CausationCodeUnion extends string, Data> extends IEvent {
  readonly data: Data;
  readonly metadata: AbstractCreateMessageMetadata<CausationCodeUnion>;
  deriveMetadata(
    this: IAbstractDomainEvent<CausationCodeUnion, Data>,
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCodeUnion>>,
  ): AbstractCreateMessageMetadata<CausationCodeUnion>;
}

export abstract class AbstractDomainEvent<
  DomainEventCodeUnion extends CausationCodeUnion,
  AggregateCode extends string,
  CausationCodeUnion extends string,
  D extends IAbstractDomainEvent<CausationCodeUnion, unknown> = IAbstractDomainEvent<
    CausationCodeUnion,
    unknown
  >,
> {
  public abstract readonly code: DomainEventCodeUnion;
  public abstract readonly resourceType: AggregateCode;

  public readonly id: string;
  public readonly resourceId: string | null;
  public readonly data: D['data'];
  public metadata: AbstractMessageMetadata<CausationCodeUnion>;

  constructor(
    resourceId: string | null,
    data: D['data'],
    metadata?: AbstractCreateMessageMetadata<CausationCodeUnion>,
  ) {
    this.id = uuidv7();
    this.data = data;
    this.resourceId = resourceId;

    this.metadata = {
      correlationId: metadata?.correlationId || null,
      causationId: metadata?.causationId || null,
      causationType: metadata?.causationType || null,
      userId: metadata?.userId || null,
      createdAt: Date.now(),
    };
  }

  public setMetadata(metadata: AbstractCreateMessageMetadata<CausationCodeUnion>): void {
    this.metadata = {
      ...this.metadata,
      ...metadata,
      correlationId: metadata.correlationId || this.metadata.correlationId,
    };
  }

  public deriveMetadata(
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCodeUnion>>,
  ): AbstractCreateMessageMetadata<CausationCodeUnion> {
    return {
      correlationId: this.metadata.correlationId, // 뿌리 유지
      causationId: this.id,
      causationType: this.code,
      userId: overrides?.userId ?? this.metadata.userId, // 행위자 유지 (필요 시 변경 가능)
      ...overrides,
    };
  }

  /** Stream Key: "resourceType:resourceId" (예: "user:19a764ab-22db-42f4-a64f-3a9dc992a4d4") */
  public get streamId(): string {
    return `${this.resourceType}:${this.resourceId}`;
  }
}
