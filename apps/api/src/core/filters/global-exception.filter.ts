import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
  LogLevel,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import { ApiErrorResponse, EXCEPTION } from '@workspace/contract';

import { ContextService } from '@/infra/context/context.service';
import { BusinessException, DomainError } from '@/shared/base';

interface ErrorInfo {
  level?: LogLevel;

  status: number;
  code: string;
  message: string;
  details?: any;
}

@Catch()
export class GlobalExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionsFilter.name);

  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly context: ContextService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const requestId = this.context.getRequestId() || 'unknown';

    // 1. 예외 분석 및 표준화된 정보 추출
    const errorInfo = this.resolveError(exception);

    // 2. 로깅 처리
    this.logError(errorInfo, exception, requestId);

    // 3. 최종 응답 객체 생성
    const responseBody: ApiErrorResponse = {
      code: errorInfo.code,
      status: errorInfo.status,
      message: errorInfo.message,
      details: errorInfo.details,
    };

    // 4. 응답 전송
    void httpAdapter.reply(ctx.getResponse(), responseBody, errorInfo.status as number);
  }

  /**
   * 예외 타입에 따라 적절한 상태 코드와 메시지를 추출합니다.
   */
  private resolveError(exception: unknown): ErrorInfo {
    if (exception instanceof DomainError) {
      return this.handleUnhandledDomainException(exception);
    }
    if (exception instanceof BusinessException) {
      return this.handleBusinessException(exception);
    }
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }
    return this.handleUnknownError();
  }

  private handleBusinessException(exception: BusinessException): ErrorInfo {
    return {
      status: exception.getStatus(),
      code: exception.code,
      message: exception.message,
      details: exception.details,
    };
  }

  /**
   * NestJS 표준 HTTP 예외 처리
   */
  private handleHttpException(exception: HttpException): ErrorInfo {
    const status = exception.getStatus();
    const res = exception.getResponse() as Record<string, any>;

    const code = res.error || `HTTP_ERROR_${status}`;
    const message = res.message || exception.message;

    return {
      status,
      code,
      message,
    };
  }

  /**
   * Controller에서 처리되지 않은 도메인 예외 처리
   */
  private handleUnhandledDomainException(exception: DomainError): ErrorInfo {
    return {
      level: 'warn',
      ...EXCEPTION.COMMON.UNHANDLED_DOMAIN_ERROR,
      details: {
        originalErrorName: exception.name,
      },
    };
  }

  /**
   * 알 수 없는 시스템 에러 처리
   */
  private handleUnknownError(): ErrorInfo {
    return {
      level: 'error',
      status: EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.status,
      code: EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.code,
      message: EXCEPTION.COMMON.INTERNAL_SERVER_ERROR.message,
      details: undefined, // 보안을 위해 상세 내용 숨김
    };
  }

  /**
   * 에러 심각도에 따른 로깅 분기 처리
   */
  private logError(info: ErrorInfo, exception: unknown, requestId: string): void {
    const logMessage = `[${requestId}] ${info.code}: ${info.message}`;

    if (info?.level === 'error' || info.status >= 500) {
      // 심각한 에러: Error 레벨 + 스택 트레이스
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(logMessage, stack);
    } else if (info?.level === 'warn' || info.status >= 400) {
      // 클라이언트 에러: Debug 레벨
      this.logger.debug(logMessage);
    }
  }
}
