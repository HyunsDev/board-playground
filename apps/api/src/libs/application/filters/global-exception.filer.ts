import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ZodError } from 'zod';

import { EXCEPTION } from '@workspace/contract';

import { ContextService } from '@/infra/context/context.service';
import { ApiErrorResponse } from '@/libs/api/api-error-responase.base';
import {
  ArgumentInvalidException,
  ArgumentNotProvidedException,
  ConflictException,
  BaseException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@/libs/exceptions';

// 내부적으로 사용할 에러 처리 결과 인터페이스
interface ErrorResolution {
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
    const responseBody = new ApiErrorResponse({
      code: errorInfo.code,
      status: errorInfo.status,
      message: errorInfo.message,
      correlationId: requestId,
      details: errorInfo.details,
    });

    // 4. 응답 전송
    httpAdapter.reply(ctx.getResponse(), responseBody, errorInfo.status);
  }

  /**
   * 예외 타입에 따라 적절한 상태 코드와 메시지를 추출합니다.
   */
  private resolveError(exception: unknown): ErrorResolution {
    if (exception instanceof ZodError) {
      return this.handleZodError(exception);
    }
    if (exception instanceof HttpException) {
      return this.handleHttpException(exception);
    }
    if (exception instanceof BaseException) {
      return this.handleDomainException(exception);
    }
    return this.handleUnknownError(exception);
  }

  /**
   * Zod 유효성 검사 에러 처리
   */
  private handleZodError(exception: ZodError): ErrorResolution {
    return {
      ...EXCEPTION.COMMON.VALIDATION_ERROR,
      details: exception.issues,
    };
  }

  /**
   * NestJS 표준 HTTP 예외 처리
   */
  private handleHttpException(exception: HttpException): ErrorResolution {
    const status = exception.getStatus();
    const res = exception.getResponse() as Record<string, any>;

    let code = res.error || `HTTP_${status}`;
    let message = res.message || exception.message;
    let details = undefined;

    // BadRequest이면서 메시지가 배열이면 유효성 검사 에러일 가능성이 높음
    if (status === HttpStatus.BAD_REQUEST && Array.isArray(res.message)) {
      code = EXCEPTION.COMMON.VALIDATION_ERROR.code;
      message = EXCEPTION.COMMON.VALIDATION_ERROR.message;
      details = res.message;
    }

    return { status, code, message, details };
  }

  /**
   * 커스텀 도메인 예외 처리
   */
  private handleDomainException(exception: BaseException): ErrorResolution {
    let status = HttpStatus.BAD_REQUEST;

    if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof ConflictException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof ForbiddenException) {
      status = HttpStatus.FORBIDDEN;
    } else if (exception instanceof InternalServerErrorException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof ArgumentNotProvidedException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    } else if (exception instanceof ArgumentInvalidException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    return {
      status,
      code: exception.code,
      message: exception.message,
      details: exception.toJSON(),
    };
  }

  /**
   * 알 수 없는 시스템 에러 처리
   */
  private handleUnknownError(exception: unknown): ErrorResolution {
    return {
      ...EXCEPTION.COMMON.INTERNAL_SERVER_ERROR,
      details: undefined, // 보안을 위해 상세 내용 숨김
    };
  }

  /**
   * 에러 심각도에 따른 로깅 분기 처리
   */
  private logError(info: ErrorResolution, exception: unknown, requestId: string): void {
    const logMessage = `[${requestId}] ${info.code}: ${info.message}`;

    if (info.status >= 500) {
      // 심각한 에러: Error 레벨 + 스택 트레이스
      const stack = exception instanceof Error ? exception.stack : undefined;
      this.logger.error(logMessage, stack);
    } else if (info.status >= 400) {
      // 클라이언트 에러: Debug 레벨
      this.logger.debug(logMessage);
    }
  }
}
