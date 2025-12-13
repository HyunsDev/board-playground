import { AbstractMessage, AbstractMessageProps } from './internal/abstract.message';

import { DomainResult, DomainError } from '@/error';

export type AbstractCommandProps<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  T = unknown,
> = AbstractMessageProps<CausationCodeType, ResourceCodeType, T>;

export type AbstractCommandResult<C extends AbstractCommand> =
  C extends AbstractCommand<string, string, string, AbstractCommandProps, unknown, infer TRes>
    ? TRes
    : never;

export abstract class AbstractCommand<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  CommandCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractCommandProps<CausationCodeType, ResourceCodeType> = AbstractCommandProps<
    CausationCodeType,
    ResourceCodeType
  >,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
> extends AbstractMessage<
  CausationCodeType,
  ResourceCodeType,
  CommandCodeType,
  TProps,
  TOk,
  TRes
> {}
