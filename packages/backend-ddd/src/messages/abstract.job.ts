import z from 'zod';

import { AbstractCreateMessageMetadata } from './abstract-message-metadata.type';
import { AbstractMessage, AbstractMessageProps } from './internal/abstract.message';

export type AbstractJobProps<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  T = unknown,
> = AbstractMessageProps<CausationCodeType, ResourceCodeType, T>;

export abstract class AbstractJob<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  JobCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractJobProps<CausationCodeType, ResourceCodeType> = AbstractJobProps<
    CausationCodeType,
    ResourceCodeType
  >,
  TOptions = void,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, JobCodeType, TProps, unknown, void> {
  abstract readonly queueName: string;
  abstract override get schema(): z.ZodType<TProps['data']>;
  readonly options?: TOptions;

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    metadata: AbstractCreateMessageMetadata<CausationCodeType, ResourceCodeType>,
    options?: TOptions,
  ) {
    super(resourceId, data, metadata);
    this.options = options;
  }
}
