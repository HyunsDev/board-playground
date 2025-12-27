/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

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

// 1. 측정 대상 메세지 타입 정의
export type MeasureMessage =
  | BaseCommand<any, any, any>
  | BaseQuery<any, any, any>
  | BaseDomainEvent<any>
  | BaseJob<any>
  | BaseIntegrationEvent<any>
  | BaseRpc<any, any, any>
  | BaseHttpRequest<any, any>;

// 2. 실행 시간 측정 함수
// TResult는 DomainResult<TOk, TError> 형태여야 합니다.
export const measure = async <
  TOk,
  TError extends DomainError,
  TResult extends DomainResult<TOk, TError>,
>(
  executor: () => Promise<TResult>,
): Promise<MeasureResult<TResult, TError>> => {
  const start = performance.now();

  try {
    const result = await executor();
    const duration = (performance.now() - start).toFixed(0);

    // neverthrow Result 패턴 체크
    if (result.isErr()) {
      return {
        result: 'DomainError',
        duration,
        value: result,
        error: result.error,
      };
    }

    return {
      result: 'Success',
      duration,
      value: result,
    };
  } catch (error) {
    const duration = (performance.now() - start).toFixed(0);

    if (error instanceof SystemException) {
      return {
        result: 'SystemException',
        duration,
        error,
      };
    }

    return {
      result: 'UnexpectedException',
      duration,
      error,
    };
  }
};

const tracer = trace.getTracer('board-playground-core');

// 3. 측정 및 로깅 통합 함수
export const measureAndLog = async <
  const TLogType extends MessageLogType,
  const TMessage extends MeasureMessage,
  TOk,
  TError extends DomainError,
  TResult extends DomainResult<TOk, TError>,
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
  executor: () => Promise<TResult>;
  // toLogData의 타입을 정확하게 매칭
  toLogData: (
    result: MeasureResult<TResult, TError>,
    message: TMessage,
    handlerName: string,
  ) => Extract<MessageResultLogData, { type: TLogType }>;
  logger: Logger;
  handlerName: string;
}): Promise<TResult> => {
  // 반환 타입 명시
  const targetName = message?.constructor?.name || 'UnknownMessage';
  const spanName = `${logType} ${targetName}`;

  return tracer.startActiveSpan(spanName, async (span) => {
    try {
      // Span 기본 속성 설정
      span.setAttribute('app.handler.name', handlerName);
      span.setAttribute('app.message.type', logType);
      span.setAttribute('app.message.name', targetName);

      // 실행 및 측정
      const measurement = await measure<TOk, TError, TResult>(executor);

      // Span 상태 업데이트
      updateSpanStatus(span, measurement);

      // 로깅 수행
      const logData = toLogData(measurement, message, handlerName);
      const logLevel = getLogLevel(measurement.result);

      logger[logLevel](logData, targetName);

      // 결과 처리: 예외인 경우 throw, 그 외(성공/도메인 에러)는 값 반환
      if (
        measurement.result === 'SystemException' ||
        measurement.result === 'UnexpectedException'
      ) {
        // measure 내부에서 catch 되었던 에러를 다시 던져서
        // 상위 레이어(Exception Filter 등)가 처리할 수 있게 함
        throw measurement.error;
      }

      // Success 혹은 DomainError (Result 객체 반환)
      return measurement.value;
    } catch (error) {
      // 예상치 못한 스코프 내 에러 기록
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

// 4. 헬퍼 함수: 로그 레벨 결정
function getLogLevel(
  resultType: MeasureResult<unknown, unknown>['result'],
): 'log' | 'warn' | 'error' {
  switch (resultType) {
    case 'Success':
      return 'log';
    case 'DomainError':
      return 'warn';
    case 'SystemException':
    case 'UnexpectedException':
      return 'error';
    default:
      return 'error';
  }
}

// 5. 헬퍼 함수: Span 상태 업데이트
function updateSpanStatus(span: Span, result: MeasureResult<unknown, any>) {
  span.setAttribute('app.result.status', result.result);
  span.setAttribute('app.duration_ms', result.duration);

  switch (result.result) {
    case 'Success':
      span.setStatus({ code: SpanStatusCode.OK });
      break;

    case 'DomainError':
      // DomainError는 예측 가능한 비즈니스 예외이므로 Span은 OK로 처리하되
      // 속성에 에러 정보를 상세히 남깁니다.
      span.setStatus({ code: SpanStatusCode.OK });
      if (result.error && typeof result.error === 'object') {
        span.setAttribute('app.domain_error.code', (result.error as any).code || 'UNKNOWN');
        span.setAttribute('app.domain_error.message', (result.error as any).message || '');
      }
      span.setAttribute('error', true); // 검색 편의성 태그
      break;

    case 'SystemException':
    case 'UnexpectedException':
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: result.error instanceof Error ? result.error.message : String(result.error),
      });
      if (result.error instanceof Error) {
        span.recordException(result.error);
      }
      break;
  }
}
