import 'dotenv/config';
import '@workspace/backend-core/instrumentation';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { httpConfig, HttpConfig, setupHttpApp, initMessaging } from '@workspace/backend-core';

import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new FastifyAdapter({
    trustProxy: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter, {
    bufferLogs: true,
  });

  void (await setupHttpApp(app, {
    enableCors: true,
  }));

  void (await initMessaging(app));

  const { port } = app.get<HttpConfig>(httpConfig.KEY);

  void (await app.listen(port, '0.0.0.0'));
  Logger.log(`🚀 Application is running on: ${await app.getUrl()}`, 'main.ts');
}

void bootstrap();
