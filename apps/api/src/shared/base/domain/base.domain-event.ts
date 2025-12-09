import { IEvent } from '@nestjs/cqrs';
import { v7 as uuidv7 } from 'uuid';

import { CreateMessageMetadata, MessageMetadata } from '../interface/message-metadata.type';

import { AggregateCode } from '@/shared/codes/aggregate.codes';
import { CausationCodes } from '@/shared/codes/causation.codes';
import { DomainEventCode } from '@/shared/codes/domain-event.codes';
import { DomainCode } from '@/shared/codes/domain.codes';

export interface IDomainEvent<Data> extends IEvent {
  readonly data: Data;
  readonly metadata: CreateMessageMetadata;
  deriveMetadata(
    this: IDomainEvent<Data>,
    overrides?: Partial<CreateMessageMetadata>,
  ): CreateMessageMetadata;
}

export abstract class BaseDomainEvent<D extends IDomainEvent<unknown> = IDomainEvent<unknown>> {
  public abstract readonly domain: DomainCode;
  public abstract readonly code: DomainEventCode;
  public abstract readonly resourceType: AggregateCode;

  public readonly id: string;
  public readonly resourceId: string | null;
  public readonly data: D['data'];
  public metadata: MessageMetadata;

  constructor(resourceId: string | null, data: D['data'], metadata?: CreateMessageMetadata) {
    this.id = uuidv7();
    this.data = data;
    this.resourceId = resourceId;

    this.metadata = {
      correlationId: metadata?.correlationId || '',
      causationId: metadata?.causationId || '',
      causationType: metadata?.causationType || CausationCodes.Infra.HttpRequest,
      userId: metadata?.userId || '',
      createdAt: Date.now(),
    };
  }

  public setMetadata(metadata: CreateMessageMetadata): void {
    this.metadata = {
      ...this.metadata,
      ...metadata,
      correlationId: metadata.correlationId || this.metadata.correlationId,
    };
  }

  public deriveMetadata(overrides?: Partial<CreateMessageMetadata>): CreateMessageMetadata {
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
