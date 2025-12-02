import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);
  const cookieSecret = configService.get<string>('COOKIE_SECRET');

  app.use(cookieParser(cookieSecret));

  // 프록시 서버 뒤에 있을 때 클라이언트 IP 얻기 위해 설정
  app.set('trust proxy', true);

  app.enableCors();
  await app.listen(port);
}

void bootstrap();
