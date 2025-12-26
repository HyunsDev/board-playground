/* eslint-disable @typescript-eslint/no-explicit-any */
import z from 'zod';

import { BrandId } from '@workspace/common';

import { AbstractMessage, AbstractMessageProps } from './abstract.message';
import { AbstractDrivenMessageMetadata } from '../abstract.message-metadata.type';

import { DomainError, DomainResultAsync } from '@/error';

export type AbstractIntegrationEventProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractIntegrationEvent<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  IntegrationEventCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractIntegrationEventProps = AbstractIntegrationEventProps,
> extends AbstractMessage<
  CausationCodeType,
  ResourceCodeType,
  IntegrationEventCodeType,
  TProps,
  any,
  DomainResultAsync<any, DomainError>
> {
  abstract override get schema(): z.ZodType<TProps['data']>;

  constructor(
    resourceId: BrandId | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>,
  ) {
    super(resourceId, data, metadata);
  }
}
