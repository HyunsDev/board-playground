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

    // [참고] 에러 메시지("request errored")도 덮어쓰고 싶다면:
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    },

    genReqId: (req) => coreContext.requestId || req.headers['x-request-id'] || 'unknown',
    mixin: () => {
      return {
        reqId: coreContext.requestId,
      };
    },

    customProps: (req: IncomingMessage, res: ServerResponse) => {
      const contextUserId = tokenContext.userId;
      const { errorCode } = coreContext;

      const baseProps = {
        userId: contextUserId ?? 'guest',
        errorCode: errorCode ?? undefined,
      };

      // 개발 환경에서는 Pretty Print에 필요한 추가 정보를 최상위 레벨로 끌어올림
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
