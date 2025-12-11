import { IncomingMessage, ServerResponse } from 'http';

import { Params } from 'nestjs-pino';

import { ContextService } from '../../context/context.service';

export const getCommonPinoConfig = (
  isProduction: boolean,
  contextService: ContextService,
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

    genReqId: (req) => contextService.getRequestId() || req.headers['x-request-id'] || 'unknown',

    customProps: (req: IncomingMessage, res: ServerResponse) => {
      const contextUserId = contextService?.getUserId();
      const errorCode = contextService?.getErrorCode();

      const baseProps = {
        userId: contextUserId ?? 'guest',
        errorCode: errorCode ?? undefined,
      };

      // 개발 환경에서는 Pretty Print에 필요한 추가 정보를 최상위 레벨로 끌어올림
      if (!isProduction) {
        return {
          ...baseProps,
          reqId: contextService.getRequestId(),
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
