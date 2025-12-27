import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { EventLogData } from '../types';

import { BaseDomainEvent } from '@/base';

export const toEventLogData = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: MeasureResult<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseDomainEvent<any>,
  handlerName: string,
): EventLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.Event,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.Event,
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
      type: LogTypeEnum.Event,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.Event,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    handlerName: handlerName,
    ...message.metadata,
  };
};
