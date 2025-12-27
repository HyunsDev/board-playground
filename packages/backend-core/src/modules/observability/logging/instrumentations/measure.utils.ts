/* eslint-disable @typescript-eslint/no-explicit-any */

import { Logger } from '@nestjs/common';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

import {
  DomainError,
  DomainResult,
  DomainResultAsync,
  SystemException,
} from '@workspace/backend-ddd';

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

export const measure = async <
  const TResult extends
    | DomainResultAsync<any, DomainError>
    | Promise<DomainResult<any, DomainError>>,
>(
  executor: () => TResult,
): Promise<MeasureResult<Awaited<TResult>>> => {
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
  | BaseHttpRequest<any, any>;

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

const tracer = trace.getTracer('board-playground-core');

export const measureAndLog = async <
  const TLogType extends MessageLogType,
  const TMessage extends MeasureMessage,
  const TResult extends
    | DomainResultAsync<any, DomainError>
    | Promise<DomainResult<any, DomainError>>,
>({
  logType,
  message,
  executor,
  toLogData,
  logger,
  handlerName,
}: {
  logType: TLogType;
  message: TMessage;
  executor: () => TResult;
  toLogData: (
    result: MeasureResult<Awaited<TResult>>,
    message: TMessage,
    handlerName: string,
  ) => Extract<MessageResultLogData, { type: TLogType }>;
  logger: Logger;
  handlerName: string;
}) => {
  const targetName = message?.constructor?.name || 'UnknownMessage';
  const spanName = `${logType} ${targetName}`;

  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      span.setAttribute('app.handler.name', handlerName);
      span.setAttribute('app.message.type', logType);
      span.setAttribute('app.message.name', targetName);

      const result = await measure(executor);

      updateSpanStatus(span, result);

      const logLevel = resultLogLevel[result.result];
      logger[logLevel](toLogData(result, message, handlerName), targetName);

      if (result.result !== 'Success' && result.result !== 'DomainError') {
        span.recordException(result.error as Error);
        throw result.error;
      }

      return result;
    } catch (error) {
      if (error instanceof Error) {
        span.recordException(error);
      }
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      span.end();
    }
  });
};

function updateSpanStatus(span: Span, result: MeasureResult<any>) {
  span.setAttribute('app.result.status', result.result);
  span.setAttribute('app.duration_ms', result.duration);

  switch (result.result) {
    case 'Success':
      span.setStatus({ code: SpanStatusCode.OK });
      break;

    case 'DomainError':
      // DomainError는 비즈니스 로직상 '실패'이지만, 시스템 관점에서는 '정상 처리'입니다.
      // 따라서 Span Status는 OK로 두되, 속성으로 에러 내용을 남깁니다.
      span.setStatus({ code: SpanStatusCode.OK });
      span.setAttribute('app.domain_error.code', result.error.code);
      span.setAttribute('app.domain_error.message', result.error.message);
      // 검색 편의를 위해 error 태그를 붙일 수도 있습니다.
      span.setAttribute('error', true);
      break;

    case 'SystemException':
    case 'UnexpectedException':
      // 시스템 예외는 명백한 오류(Error)입니다.
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (result.error as Error).message,
      });
      span.recordException(result.error as Error);
      break;
  }
}
