import { AbstractMessage, AbstractMessageProps } from './internal/abstract.message';

export type AbstractDomainEventProps<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  T = unknown,
> = AbstractMessageProps<CausationCodeType, ResourceCodeType, T>;

export abstract class AbstractDomainEvent<
  CausationCodeType extends string = string,
  ResourceCodeType extends string = string,
  DomainEventCodeType extends CausationCodeType = CausationCodeType,
  TProps extends AbstractDomainEventProps<CausationCodeType, ResourceCodeType> =
    AbstractDomainEventProps<CausationCodeType, ResourceCodeType>,
> extends AbstractMessage<
  CausationCodeType,
  ResourceCodeType,
  DomainEventCodeType,
  TProps,
  unknown,
  void
> {}
