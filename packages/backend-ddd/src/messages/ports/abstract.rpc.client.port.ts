/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '../message.types';
import { AbstractRpc, AbstractRpcProps } from '../messages';

export abstract class AbstractRpcClientPort {
  abstract send<C extends AbstractRpc<any, any, any, AbstractRpcProps<any>, any, any>>(
    rpc: C,
  ): Promise<MessageResult<C>>;
}
