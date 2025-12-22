/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from '@nestjs/common';

import { DomainError, DomainResult, SystemException } from '@workspace/backend-ddd';

import { MessageLogType } from '../log.enums';
import { MessageResultLogData } from '../types';
import { MeasureResult } from './instrumentation.types';

import {
  BaseCommand,
  BaseDomainEvent,
  BaseHttpRequest,
  BaseIntegrationEvent,
  BaseJob,
  BaseQuery,
  BaseRpc,
} from '@/base';

export const measure = async <TResult extends DomainResult<any, DomainError>>(
  executor: () => Promise<TResult>,
): Promise<MeasureResult<TResult>> => {
  const start = performance.now();

  try {
    const result = await executor();
    const duration = (performance.now() - start).toFixed(0);

    if (result?.isErr?.()) {
      return {
        duration,
        result: 'DomainError',
        value: result,
        error: result.error,
      } as const;
    }

    return {
      duration,
      result: 'Success',
      value: result,
    } as const;
  } catch (error) {
    const duration = (performance.now() - start).toFixed(0);

    if (error instanceof SystemException) {
      return {
        duration,
        result: 'SystemException',
        error,
      } as const;
    }

    return {
      duration,
      result: 'UnexpectedException',
      error,
    } as const;
  }
};

export type MeasureMessage =
  | BaseCommand<any, any, any>
  | BaseQuery<any, any, any>
  | BaseDomainEvent<any>
  | BaseJob<any>
  | BaseIntegrationEvent<any>
  | BaseRpc<any, any, any>
  | BaseHttpRequest<any, any, any>;

export type LogDataMapper<
  TMessage extends MeasureMessage,
  TLogData extends MessageResultLogData,
> = (result: MeasureResult<any>, message: TMessage, handlerName: string) => TLogData;

const resultLogLevel = {
  Success: 'log',
  DomainError: 'warn',
  SystemException: 'error',
  UnexpectedException: 'error',
} as const;

export const measureAndLog = async <
  const TLogType extends MessageLogType,
  const TMessage extends MeasureMessage,
  const TResult extends DomainResult<any, DomainError>,
>({
  message,
  executor,
  toLogData,
  logger,
  handlerName,
}: {
  logType: TLogType;
  message: TMessage;
  executor: () => Promise<TResult>;
  toLogData: (
    result: MeasureResult<TResult>,
    message: TMessage,
    handlerName: string,
  ) => Extract<MessageResultLogData, { type: TLogType }>;
  logger: Logger;
  handlerName: string;
}) => {
  const result = await measure(executor);

  const targetName = message?.constructor?.name || 'UnknownMessage';
  const logLevel = resultLogLevel[result.result];

  logger[logLevel](toLogData(result, message, handlerName), targetName);

  if (result.result !== 'Success' && result.result !== 'DomainError') {
    throw result.error;
  }

  return result.value;
};
