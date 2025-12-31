/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';

import { BrandId } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';
import { AbstractMessageGenerics } from '../message.types';

import { DomainError, DomainResult } from '@/error';

export type AbstractIntegrationEventProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractIntegrationEvent<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractIntegrationEventProps = AbstractIntegrationEventProps,
> extends AbstractMessage<TGenerics, TProps, any, DomainResult<any, DomainError>> {
  abstract override get schema(): z.ZodType<TProps['data']>;

  constructor(
    resourceId: BrandId | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<TGenerics>,
  ) {
    super(resourceId, data, metadata);
  }
}
