/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageResult } from '@workspace/backend-ddd';

import { BaseRpc } from '../messages/base.rpc';

export abstract class RpcClientPort {
  abstract send<C extends BaseRpc<any, any, any>>(rpc: C): MessageResult<C>;
}
