import { AbstractMessage, AbstractMessageProps } from './abstract.message';

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
  unknown,
  void
> {}
