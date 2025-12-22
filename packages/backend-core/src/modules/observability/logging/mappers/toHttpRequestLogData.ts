import { MessageResult } from '@workspace/backend-ddd';

import { MeasureResult } from '../instrumentations/instrumentation.types';
import { LogTypeEnum } from '../log.enums';
import { HttpRequestLogData } from '../types';

import { BaseHttpRequest } from '@/base';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toHttpRequestLogData = <TMessage extends BaseHttpRequest<any, any>>(
  result: MeasureResult<MessageResult<TMessage>>,
  message: TMessage,
): HttpRequestLogData => {
  if (result.result === 'Success') {
    return {
      type: LogTypeEnum.HttpRequest,
      result: 'Success',
      code: message.code,
      duration: result.duration,
      method: message.data.method,
      url: message.data.url,
      status: result.value?.value?.status,
      ...message.metadata,
    };
  }

  if (result.result === 'DomainError') {
    return {
      type: LogTypeEnum.HttpRequest,
      result: 'DomainError',
      code: message.code,
      duration: result.duration,
      error: result.error,
      method: message.data.method,
      url: message.data.url,
      status: result.value?.value?.status,
      ...message.metadata,
    };
  }

  if (result.result === 'SystemException') {
    return {
      type: LogTypeEnum.HttpRequest,
      result: 'SystemException',
      code: message.code,
      duration: result.duration,
      error: result.error,
      method: message.data.method,
      url: message.data.url,
      ...message.metadata,
    };
  }

  return {
    type: LogTypeEnum.HttpRequest,
    result: 'UnexpectedException',
    code: message.code,
    duration: result.duration,
    error: result.error,
    method: message.data.method,
    url: message.data.url,
    ...message.metadata,
  };
};
