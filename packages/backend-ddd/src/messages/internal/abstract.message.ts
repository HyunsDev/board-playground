import { v7 as uuidv7 } from 'uuid';
import { z } from 'zod';

import {
  AbstractCreateMessageMetadata,
  AbstractMessageMetadata,
} from '../abstract-message-metadata.type';
import { RESULT_TYPE_SYMBOL } from '../message.constant';

import {
  DomainError,
  DomainResult,
  InvalidMessageException,
  MessageCodeMismatchException,
} from '@/error';

const MessageMetadataSchema = z.object({
  createdAt: z.number(),
  correlationId: z.string(),
  causationType: z.string(),
  resourceId: z.string().nullable(),
  resourceType: z.string(),
  causationId: z.string(),
  userId: z.string().nullable(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = any> = new (...args: any[]) => T;

export type AbstractMessageProps<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  T = unknown,
> = {
  readonly data: T;
  readonly metadata: AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>;
};

export abstract class AbstractMessage<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  MessageCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractMessageProps<CausationCodeType, ResourceCodeType> = AbstractMessageProps<
    CausationCodeType,
    ResourceCodeType
  >,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> | void = void,
> {
  declare readonly [RESULT_TYPE_SYMBOL]: TRes;

  abstract readonly code: MessageCodeType;
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

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    createMetadata: AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>,
  ) {
    const { correlationId, causationId, causationType, userId } = createMetadata;

    this._id = uuidv7();
    this._data = data;
    this._metadata = {
      correlationId: correlationId || null,
      causationId: causationId || null,
      causationType: causationType || null,
      resourceId: resourceId,
      userId: userId || null,
      createdAt: Date.now(),
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

  static fromPlain<
    CausationCodeType extends string,
    ResourceCodeType extends string,
    MessageCodeType extends CausationCodeType,
    I extends AbstractMessageProps<CausationCodeType, ResourceCodeType>,
    M extends AbstractMessage<CausationCodeType, ResourceCodeType, MessageCodeType, I>,
  >(
    this: Constructor<M>,
    plain: {
      id: string;
      code: string;
      data: unknown;
      metadata: AbstractMessageMetadata;
    },
  ): AbstractMessage<CausationCodeType, ResourceCodeType, MessageCodeType, I> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const message = Object.create(this.prototype) as M;

    // Code 유효성 검사
    if (plain.code !== message.code) {
      throw new MessageCodeMismatchException(message.code, plain.code);
    }

    // ID 유효성 검사
    const IdCheckResult = z.string().safeParse(plain.id);
    if (!IdCheckResult.success) {
      throw new InvalidMessageException(IdCheckResult.error.issues);
    }

    const { schema } = message;
    if (schema) {
      const parseResult = schema.safeParse(plain.data);
      if (!parseResult.success) {
        throw new InvalidMessageException(parseResult.error.issues);
      }
      plain.data = parseResult.data;
    }

    const metadataParseResult = MessageMetadataSchema.safeParse(plain.metadata);
    if (!metadataParseResult.success) {
      throw new InvalidMessageException(metadataParseResult.error.issues);
    }
    plain.metadata = metadataParseResult.data;

    message._id = plain.id;
    message._data = plain.data;
    message._metadata = {
      correlationId: plain.metadata.correlationId,
      causationId: plain.metadata.causationId,
      causationType: plain.metadata.causationType as CausationCodeType,
      resourceId: plain.metadata.resourceId,
      userId: plain.metadata.userId,
      createdAt: plain.metadata.createdAt,
    };

    return message;
  }

  updateMetadata(
    metadata: Partial<AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>>,
  ): void {
    this._metadata = {
      ...this._metadata,
      ...metadata,
      correlationId: metadata.correlationId || this._metadata.correlationId,
    };
  }

  deriveMetadata(
    overrides?: Partial<AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>>,
  ): AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType> {
    return {
      correlationId: this._metadata.correlationId, // 뿌리 유지
      causationId: this._id,
      causationType: this.code as CausationCodeType,
      userId: this._metadata.userId,
      ...overrides,
    };
  }
}
