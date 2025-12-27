import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { RpcLogData } from '../types';

import { BaseRpc } from '@/base';

export const toRpcLogData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: MeasureResult<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseRpc<any, any, any>,
  handlerName: string,
): RpcLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.Rpc,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.Rpc,
      result: 'DomainError',
      code: message.code,
      duration: result.duration,
      error: result.error,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  if (result.result === 'SystemException') {
    return {
      type: LogTypeEnum.Rpc,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.Rpc,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    handlerName: handlerName,
    ...message.metadata,
  };
};
