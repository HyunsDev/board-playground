import { RESULT_TYPE_SYMBOL } from '../message.constant';
import { AbstractMessageGenerics } from '../message.types';
import { AbstractMessage, AbstractMessageProps } from './abstract.message';

import { DomainError, DomainResult } from '@/error';

export type AbstractCommandProps<T = unknown> = AbstractMessageProps<T>;

export type AbstractCommandResult<C extends AbstractCommand> =
  C extends AbstractCommand<AbstractMessageGenerics, AbstractCommandProps, unknown, infer TRes>
    ? TRes
    : never;

export abstract class AbstractCommand<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractCommandProps = AbstractCommandProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<TGenerics, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
}
