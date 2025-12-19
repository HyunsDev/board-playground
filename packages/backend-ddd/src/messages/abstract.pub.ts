import z from 'zod';

import { AbstractDrivenMessageMetadata } from './abstract-message-metadata.type';
import { AbstractMessage, AbstractMessageProps } from './abstract.message';

export type AbstractPubProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractPub<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  PubCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractPubProps = AbstractPubProps,
> extends AbstractMessage<CausationCodeType, ResourceCodeType, PubCodeType, TProps, unknown, void> {
  abstract override get schema(): z.ZodType<TProps['data']>;

  constructor(
    resourceId: string | null,
    data: TProps['data'],
    metadata?: AbstractDrivenMessageMetadata<CausationCodeType, ResourceCodeType>,
  ) {
    super(resourceId, data, metadata);
  }
}
