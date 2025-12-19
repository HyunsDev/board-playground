import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

import {
  AbstractCreateMessageMetadata,
  AbstractDrivenMessageMetadata,
  AbstractMessageMetadata,
} from './abstract-message-metadata.type';
import { RESULT_TYPE_SYMBOL } from './message.constant';

import {
  DomainError,
  DomainResult,
  InvalidMessageException,
  MessageCodeMismatchException,
} from '@/error';

const MessageMetadataSchema = z.object({
  createdAt: z.number(),
  correlationId: z.string().nullable(),
  causationType: z.string(),
  resourceId: z.string().nullable(),
  resourceType: z.string(),
  causationId: z.string().nullable(),
  userId: z.string().nullable(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;

export type AbstractMessageProps<T = unknown> = {
  readonly data: T;
};

export abstract class AbstractMessage<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  MessageCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractMessageProps = AbstractMessageProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> | void = DomainResult<TOk, DomainError> | void,
> {
  declare readonly [RESULT_TYPE_SYMBOL]: TRes;

  static readonly code: string;
  protected abstract readonly resourceType: ResourceCodeType;

  protected _id: string;
  protected _data: TProps['data'];
  protected _metadata: Omit<
    AbstractMessageMetadata<CausationCodeType, ResourceCodeType>,
    'resourceType'
  >;
  get id(): string {
    return this._id;
  }
  get data(): TProps['data'] {
    return this._data;
  }
  get schema(): z.ZodType<TProps['data']> | undefined {
    return undefined;
  }
  get metadata(): AbstractMessageMetadata<CausationCodeType, ResourceCodeType> {
    return {
      ...this._metadata,
      resourceType: this.resourceType,
    };
  }
  get code(): MessageCodeType {
    return (this.constructor as typeof AbstractMessage).code as MessageCodeType;
  }

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    metadata?: AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>,
    id?: string | null,
  ) {
    const {
      correlationId,
      causationId,
      causationType,
      userId,
      createdAt,
      resourceId: metadataResourceId,
    } = metadata || {};

    this._id = id ?? uuidv7();
    this._data = data;
    this._metadata = {
      correlationId: correlationId || null,
      causationId: causationId || null,
      causationType: causationType || null,
      resourceId: metadataResourceId ?? resourceId,
      userId: userId ?? null,
      createdAt: createdAt ?? Date.now(),
    };
  }

  toPlain() {
    return {
      id: this._id,
      code: this.code,
      data: this._data,
      metadata: this.metadata,
    };
  }

  static fromPlain<M extends AbstractMessage>(
    this: Constructor<M>, // 'this'는 생성자(클래스 자체)를 가리킴
    plain: {
      id: string;
      code: string;
      data: unknown;
      metadata: AbstractMessageMetadata;
    },
  ): M {
    // 1. ID 유효성 검사 (생성 전에 수행하여 비용 절약)
    const idResult = z.string().safeParse(plain.id);
    if (!idResult.success) {
      throw new InvalidMessageException(idResult.error.issues);
    }

    // 2. Metadata 유효성 검사
    const metadataResult = MessageMetadataSchema.safeParse(plain.metadata);
    if (!metadataResult.success) {
      throw new InvalidMessageException(metadataResult.error.issues);
    }
    const validatedMetadata = metadataResult.data;

    // 3. 인스턴스 생성 (Constructor 활용)
    // 생성자를 통해 _id, _metadata, _data가 안전하게 초기화됨
    const instance = new this(
      validatedMetadata.resourceId,
      plain.data,
      validatedMetadata,
      idResult.data,
    );

    // 4. Code 일치 여부 검사
    // 인스턴스가 생성되었으므로 필드/Getter 상관없이 code 접근 가능
    if (instance.code !== plain.code) {
      throw new MessageCodeMismatchException(instance.code, plain.code);
    }

    // 5. Data(Schema) 유효성 검사 및 데이터 정제
    if (instance.schema) {
      const dataResult = instance.schema.safeParse(plain.data);
      if (!dataResult.success) {
        throw new InvalidMessageException(dataResult.error.issues);
      }

      // Zod가 데이터를 변환(transform)했을 수 있으므로 정제된 데이터로 교체
      // 같은 클래스 내부이므로 protected 필드인 _data에 접근 가능
      instance._data = dataResult.data;
    }

    return instance;
  }

  updateMetadata(
    metadata: Partial<AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>>,
  ): void {
    this._metadata = {
      ...this._metadata,
      ...metadata,
      correlationId: metadata.correlationId || this._metadata.correlationId,
    };
  }

  deriveMetadata(
    overrides?: Partial<AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>>,
  ): AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType> {
    return {
      correlationId: this._metadata.correlationId, // 뿌리 유지
      causationId: this._id,
      causationType: this.code as CausationCodeType,
      userId: this._metadata.userId,
      ...overrides,
    };
  }
}

export interface MessageConstructor<T extends AbstractMessage> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: any[]): T;
  code: T['code'];
  fromPlain(plain: {
    id: string;
    code: string;
    data: unknown;
    metadata: AbstractMessageMetadata;
  }): T;
}
