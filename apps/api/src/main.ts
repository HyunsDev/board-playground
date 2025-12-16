import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { httpConfig, HttpConfig, setupHttpApp } from '@workspace/backend-core';

import { AppModule } from './app.module';

async function bootstrap() {
  // 1. Fastify Adapter 생성 및 설정
  // 'trust proxy'는 여기서 설정하는 것이 가장 정확합니다.
  const adapter = new FastifyAdapter({
    trustProxy: true,
  });

  // 2. 앱 생성 (NestFastifyApplication 타입 지정)
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  // 3. 공통 설정 적용 (await 추가)
  void (await setupHttpApp(app, {
    enableCors: true,
  }));

  const { port } = app.get<HttpConfig>(httpConfig.KEY);

  // 4. 서버 시작 (0.0.0.0 필수)
  void (await app.listen(port, '0.0.0.0'));
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
