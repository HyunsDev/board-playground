/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractMessageGenerics } from '../message.types';
import { AbstractMessage, AbstractMessageProps } from './abstract.message';

import { DomainError, DomainResult } from '@/error';

export type AbstractDomainEventProps<T = unknown> = AbstractMessageProps<T>;

export abstract class AbstractDomainEvent<
  TGenerics extends AbstractMessageGenerics = AbstractMessageGenerics,
  TProps extends AbstractDomainEventProps = AbstractDomainEventProps,
> extends AbstractMessage<TGenerics, TProps, any, DomainResult<any, DomainError>> {}
