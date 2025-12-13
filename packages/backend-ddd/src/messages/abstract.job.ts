import z from 'zod';

import { AbstractDrivenMessageMetadata } from './abstract-message-metadata.type';
import { AbstractMessage, AbstractMessageProps } from './internal/abstract.message';

export type AbstractJobProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractJob<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  JobCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractJobProps = AbstractJobProps,
  TOptions = void,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, JobCodeType, TProps, unknown, void> {
  abstract readonly queueName: string;
  abstract override get schema(): z.ZodType<TProps['data']>;

  protected readonly _options?: TOptions;

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    metadata: AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>,
    options?: TOptions,
  ) {
    super(resourceId, data, metadata);
    this._options = options;
  }

  abstract get options(): TOptions;
}
