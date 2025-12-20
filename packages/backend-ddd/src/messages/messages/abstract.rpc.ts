import z from 'zod';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';

import { DomainResult, DomainError } from '@/error';

export type AbstractRpcProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractRpc<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  RpcCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractRpcProps = AbstractRpcProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
  TOptions = void,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, RpcCodeType, TProps, TOk, TRes> {
  abstract override get schema(): z.ZodType<TProps['data']>;

  protected readonly _options?: TOptions;

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>,
    options?: TOptions,
  ) {
    super(resourceId, data, metadata);
    this._options = options;
  }

  abstract get options(): TOptions;
}
