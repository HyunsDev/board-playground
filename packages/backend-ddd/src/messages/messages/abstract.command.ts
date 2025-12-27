import { RESULT_TYPE_SYMBOL } from '../message.constant';
import { AbstractMessage, AbstractMessageProps } from './abstract.message';

import { DomainError, DomainResult } from '@/error';

export type AbstractCommandProps<T = unknown> = AbstractMessageProps<T>;

export type AbstractCommandResult<C extends AbstractCommand> =
  C extends AbstractCommand<string, string, string, AbstractCommandProps, unknown, infer TRes>
    ? TRes
    : never;

export abstract class AbstractCommand<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  CommandCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractCommandProps = AbstractCommandProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, CommandCodeType, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
}
