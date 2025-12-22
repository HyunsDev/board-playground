import { IncomingMessage, ServerResponse } from 'http';

import { trace, context } from '@opentelemetry/api'; // [추가 1] OTel API 임포트
import { Params } from 'nestjs-pino';

import { CoreContext, TokenContext } from '@/modules/foundation/context';

export const getCommonPinoConfig = (
  isProduction: boolean,
  coreContext: CoreContext,
  tokenContext: TokenContext,
): Params['pinoHttp'] => {
  return {
    serializers: {
      err: (e) => e,
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
    },

    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },

    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },

    genReqId: (req) => coreContext.requestId || req.headers['x-request-id'] || 'unknown',

    // [수정 2] mixin: 모든 로그 라인에 공통 필드(traceId, spanId)를 병합합니다.
    mixin: () => {
      // 1. 현재 활성화된 Span 가져오기
      const span = trace.getSpan(context.active());

      // 2. Span이 없으면(추적되지 않는 요청 등) 빈 객체
      if (!span) {
        return {
          reqId: coreContext.requestId,
        };
      }

      // 3. Span Context에서 ID 추출
      const { traceId, spanId, traceFlags } = span.spanContext();

      return {
        reqId: coreContext.requestId, // 기존 로직 유지
        traceId, // 로그와 트레이스를 연결하는 핵심 키
        spanId,
        traceFlags: `0${traceFlags.toString(16)}`, // (선택) 샘플링 여부 등을 확인
      };
    },

    customProps: (req: IncomingMessage, res: ServerResponse) => {
      const contextUserId = tokenContext.userId;
      const { errorCode } = coreContext;

      const baseProps = {
        userId: contextUserId ?? 'guest',
        errorCode: errorCode ?? undefined,
      };

      if (!isProduction) {
        return {
          ...baseProps,
          reqId: coreContext.requestId,
          httpMethod: req.method,
          reqUrl: req.url,
          resStatus: res.statusCode,
        };
      }
      return baseProps;
    },

    redact: ['req.headers.authorization', 'req.body.password'],
    level: isProduction ? 'info' : 'debug',
    autoLogging: {
      ignore: (req) => (req.url || '').includes('/health'),
    },
  };
};
