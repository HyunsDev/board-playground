/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractMessage, AbstractMessageProps } from './abstract.message';

import { DomainError, DomainResultAsync } from '@/error';

export type AbstractDomainEventProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractDomainEvent<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  DomainEventCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractDomainEventProps = AbstractDomainEventProps,
> extends AbstractMessage<
  CausationCodeType,
  ResourceCodeType,
  DomainEventCodeType,
  TProps,
  any,
  DomainResultAsync<any, DomainError>
> {}
