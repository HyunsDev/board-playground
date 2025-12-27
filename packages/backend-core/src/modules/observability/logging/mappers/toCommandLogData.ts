import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { CommandLogData } from '../types';

import { BaseCommand } from '@/base';

export const toCommandLogData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: MeasureResult<any, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseCommand<any, any, any>,
  _handlerName: string,
): CommandLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.Command,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.Command,
      result: 'DomainError',
      code: message.code,
      duration: result.duration,
      error: result.error,
      ...message.metadata,
    };
  }

  if (result.result === 'SystemException') {
    return {
      type: LogTypeEnum.Command,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.Command,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    ...message.metadata,
  };
};
