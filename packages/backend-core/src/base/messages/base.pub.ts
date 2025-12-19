import { AbstractPubProps, AbstractPub } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, PubCode } from '@workspace/domain';

export type BasePubProps<T> = AbstractPubProps<T>;

export abstract class BasePub<TProps extends BasePubProps<unknown>> extends AbstractPub<
  CausationCode,
  DomainCode,
  PubCode,
  TProps
> {
  static readonly code: PubCode;
}
