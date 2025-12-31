import { AbstractMessageMetadata } from './abstract.message-metadata.type';
import { RESULT_TYPE_SYMBOL } from './message.constant';
import { AbstractMessage } from './messages';

export type MessageResult<C extends AbstractMessage> = C[typeof RESULT_TYPE_SYMBOL];

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

export type PlainMessage<T extends AbstractMessage> = ReturnType<T['toPlain']>;

export type AbstractMessageGenerics<T extends string = string, U extends T = T> = Readonly<{
  readonly TCausationType: T;
  readonly TResourceCode: string;
  readonly TMessageCode: U;
  readonly TUserId: string;
}>;
