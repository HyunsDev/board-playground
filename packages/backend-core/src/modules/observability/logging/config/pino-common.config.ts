import { IncomingMessage, ServerResponse } from 'http';

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
      return {
        reqId: coreContext.requestId, // 기존 로직 유지
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
