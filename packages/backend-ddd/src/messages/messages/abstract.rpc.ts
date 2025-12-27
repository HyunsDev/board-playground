import z from 'zod';

import { BrandId } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';
import { RESULT_TYPE_SYMBOL } from '../message.constant';

import { DomainError, DomainResult } from '@/error';

export type AbstractRpcProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractRpc<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  RpcCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractRpcProps = AbstractRpcProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOptions = any,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, RpcCodeType, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
  abstract override get schema(): z.ZodType<TProps['data']>;

  protected readonly _options?: TOptions;

  constructor(
    resourceId: BrandId | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>,
    options?: TOptions,
  ) {
    super(resourceId, data, metadata);
    this._options = options;
  }

  abstract get options(): TOptions;
}
