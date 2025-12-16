import { LogTypeEnum } from '../log.enums';
import { QueryLogData } from '../types';
import { MeasureResult } from './instrumentation.types';

import { BaseQuery } from '@/base';

export const toQueryLogData = (
  result: MeasureResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseQuery<any, any, any>,
): QueryLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.Query,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      queryData: message.data,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.Query,
      result: 'DomainError',
      code: message.code,
      duration: result.duration,
      error: result.error,
      queryData: message.data,
      ...message.metadata,
    };
  }

  if (result.result === 'SystemException') {
    return {
      type: LogTypeEnum.Query,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      queryData: message.data,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.Query,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    queryData: message.data,
    ...message.metadata,
  };
};
