import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { IntegrationEventLogData } from '../types';

import { BaseIntegrationEvent } from '@/base';

export const toIntegrationEventLogData = (
  result: MeasureResult,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  message: BaseIntegrationEvent<any>,
  handlerName: string,
): IntegrationEventLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.IntegrationEvent,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.IntegrationEvent,
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
      type: LogTypeEnum.IntegrationEvent,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      handlerName: handlerName,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.IntegrationEvent,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    handlerName: handlerName,
    ...message.metadata,
  };
};
