import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';
import { CookieConfig, cookieConfig } from './infra/config/configs/cookie.config';
import { executionConfig, ExecutionConfig } from './infra/config/configs/execution.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  void app.useLogger(app.get(Logger));
  void app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const { port } = app.get<ExecutionConfig>(executionConfig.KEY);
  const { cookieSecret } = app.get<CookieConfig>(cookieConfig.KEY);

  void app.use(cookieParser(cookieSecret));

  // 프록시 서버 뒤에 있을 때 클라이언트 IP 얻기 위해 설정
  void app.set('trust proxy', true);

  void app.enableCors();
  void (await app.listen(port));
}

void bootstrap();
