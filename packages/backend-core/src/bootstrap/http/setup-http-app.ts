import fastifyCookie from '@fastify/cookie'; // 쿠키 플러그인 변경
import { NestFastifyApplication } from '@nestjs/platform-fastify'; // 타입 변경
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { httpConfig, HttpConfig } from '@/modules/config';

export interface BootstrapOptions {
  enableCors?: boolean;
}

export async function setupHttpApp(app: NestFastifyApplication, options: BootstrapOptions = {}) {
  // Logger 연결
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // Global Interceptors
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // CORS
  if (options.enableCors) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Cookie Parser 교체 -> Fastify Plugin 등록
  const { cookieSecret } = app.get<HttpConfig>(httpConfig.KEY);

  // app.use(cookieParser()) 대신 app.register 사용
  await app.register(fastifyCookie, {
    secret: cookieSecret, // 서명(signed) 쿠키 사용 시 필요
  });

  // Graceful Shutdown
  app.enableShutdownHooks();
}
