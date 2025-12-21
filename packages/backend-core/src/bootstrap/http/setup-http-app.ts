import fastifyCookie from '@fastify/cookie'; // 쿠키 플러그인 변경
import helmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import { NestFastifyApplication } from '@nestjs/platform-fastify'; // 타입 변경
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { ApiError } from '@workspace/common';

import { httpConfig, HttpConfig } from '@/modules/foundation/config';

export interface BootstrapOptions {
  enableCors?: boolean;
}

export async function setupHttpApp(app: NestFastifyApplication, options: BootstrapOptions = {}) {
  // Logger
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // Global Interceptors
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // helmet
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
        scriptSrc: [`'self'`, `'unsafe-inline'`],
      },
    },
  });

  // config
  const config = app.get<HttpConfig>(httpConfig.KEY);

  // rate-limit
  await app.register(fastifyRateLimit, {
    max: config.throttleLimit,
    timeWindow: config.throttleTtl * 1000,

    keyGenerator: (req) => {
      return req.ip;
    },
    errorResponseBuilder: (req, context) => {
      return {
        status: 429,
        code: 'TOO_MANY_REQUESTS',
        message: `요청이 너무 많습니다. ${context.after}초 후에 다시 시도해주세요.`,
      } satisfies ApiError;
    },
    allowList: ['127.0.0.1', '::1'],
  });

  // CORS
  if (options.enableCors) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Cookie
  await app.register(fastifyCookie, {
    secret: config.cookieSecret,
  });

  // Graceful Shutdown
  app.enableShutdownHooks();
}
