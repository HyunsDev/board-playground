import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { JobLogData } from '../types';

import { BaseJob } from '@/base';

export const toJobLogData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: MeasureResult<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseJob<any>,
  _handlerName: string,
): JobLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.Job,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.Job,
      result: 'DomainError',
      code: message.code,
      duration: result.duration,
      error: result.error,
      ...message.metadata,
    };
  }

  if (result.result === 'SystemException') {
    return {
      type: LogTypeEnum.Job,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.Job,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    ...message.metadata,
  };
};
