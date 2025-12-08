import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  void app.useLogger(app.get(Logger));
  void app.useGlobalInterceptors(new LoggerErrorInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const cookieSecret = configService.get<string>('COOKIE_SECRET');

  void app.use(cookieParser(cookieSecret));

  // 프록시 서버 뒤에 있을 때 클라이언트 IP 얻기 위해 설정
  void app.set('trust proxy', true);

  void app.enableCors();
  void (await app.listen(port));
}

void bootstrap();
