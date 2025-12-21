import fastifyCookie from '@fastify/cookie'; // 쿠키 플러그인 변경
import helmet from '@fastify/helmet';
import { NestFastifyApplication } from '@nestjs/platform-fastify'; // 타입 변경
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

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

  // CORS
  if (options.enableCors) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Cookie
  const { cookieSecret } = app.get<HttpConfig>(httpConfig.KEY);
  await app.register(fastifyCookie, {
    secret: cookieSecret,
  });

  // Graceful Shutdown
  app.enableShutdownHooks();
}
