/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '../message.types';
import { AbstractRpc, AbstractRpcProps } from '../messages';

export abstract class RpcClientPort {
  abstract send<C extends AbstractRpc<string, string, string, AbstractRpcProps<any>>>(
    rpc: C,
  ): Promise<MessageResult<C>>;
}
