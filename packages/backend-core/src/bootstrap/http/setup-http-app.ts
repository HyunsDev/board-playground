import { INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { httpConfig, HttpConfig } from '@/modules/config';

export interface BootstrapOptions {
  enableCors?: boolean;
}

export function setupHttpApp(app: INestApplication, options: BootstrapOptions = {}) {
  // Logger 연결 (nestjs-pino)
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.flushLogs();

  // Global Interceptors (Infrastructure Level)
  // - LoggerErrorInterceptor: 포착되지 않은 500 에러 등을 자동으로 로깅
  // - 주의: 비즈니스 로직 에러(Result.err)는 대부분 Controller에서 처리되므로 여기서 잡지 않음
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  // Infrastructure Settings
  // 프록시(로드밸런서) 뒤에서 클라이언트 IP 식별
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).set('trust proxy', true);

  // CORS
  if (options.enableCors) {
    app.enableCors({
      origin: true,
      credentials: true,
    });
  }

  // Cookie Parser
  const { cookieSecret } = app.get<HttpConfig>(httpConfig.KEY);
  void app.use(cookieParser(cookieSecret));

  // Graceful Shutdown
  // SIGTERM 시그널 등을 받았을 때 연결을 안전하게 끊음
  app.enableShutdownHooks();
}
