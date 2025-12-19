import { AbstractRpcProps, AbstractRpc, DomainError, DomainResult } from '@workspace/backend-ddd';
import { CausationCode, DomainCode, RpcCode } from '@workspace/domain';

export type RpcOptions = {
  timeoutMs?: number;
};

export type BaseRpcProps<T> = AbstractRpcProps<T>;

export abstract class BaseRpc<
  TProps extends BaseRpcProps<unknown>,
  TOk,
  TRes extends DomainResult<TOk, DomainError>,
> extends AbstractRpc<CausationCode, DomainCode, RpcCode, TProps, TOk, TRes, RpcOptions> {
  static readonly code: RpcCode;

  get options(): RpcOptions {
    return {
      ...this._options,
    };
  }
}
