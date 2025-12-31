/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';

import { BrandId } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';
import { AbstractMessageGenerics } from '../message.types';

import { DomainError, DomainResult } from '@/error';

export type AbstractJobProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractJob<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractJobProps = AbstractJobProps,
  TOptions = void,
> extends AbstractMessage<TGenerics, TProps, any, DomainResult<any, DomainError>> {
  abstract readonly queueName: string;
  abstract override get schema(): z.ZodType<TProps['data']>;

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
