import {
  AbstractRpcProps,
  AbstractRpc,
  DomainError,
  RESULT_TYPE_SYMBOL,
  DomainResult,
} from '@workspace/backend-ddd';
import { CausationCode, DomainCode, ModelId, RpcCode } from '@workspace/domain';

import { DrivenMessageMetadata } from '../message-metadata';

export type RpcOptions = {
  timeoutMs?: number;
};

export type BaseRpcProps<T> = AbstractRpcProps<T>;

export abstract class BaseRpc<
  TProps extends BaseRpcProps<unknown>,
  TOk,
  TRes extends DomainResult<TOk, DomainError>,
> extends AbstractRpc<CausationCode, DomainCode, RpcCode, TProps, TOk, TRes, RpcOptions> {
  declare [RESULT_TYPE_SYMBOL]: TRes;
  static readonly code: RpcCode;

  get options(): RpcOptions {
    return {
      ...this._options,
    };
  }

  constructor(
    resourceId: ModelId | null,
    data: TProps['data'],
    metadata?: DrivenMessageMetadata,
    options?: RpcOptions,
  ) {
    super(resourceId, data, metadata, options);
  }
}
