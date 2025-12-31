import { BrandId } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';
import { RESULT_TYPE_SYMBOL } from '../message.constant';
import { AbstractMessageGenerics } from '../message.types';

import { DomainError, DomainResult } from '@/error';

export type AbstractHttpRequestProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractHttpRequest<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractHttpRequestProps = AbstractHttpRequestProps,
  TOk = unknown,
  TRes extends DomainResult<TOk, DomainError> = DomainResult<TOk, DomainError>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TOptions = any,
> extends AbstractMessage<TGenerics, TProps, TOk, TRes> {
  declare [RESULT_TYPE_SYMBOL]: TRes;

  protected readonly _options?: TOptions;

  constructor(
    resourceId: BrandId | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<TGenerics>,
    options?: TOptions,
  ) {
    super(resourceId, data, metadata);
    this._options = options;
  }

  abstract get options(): TOptions;
}
