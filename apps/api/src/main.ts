import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';

import { httpConfig, HttpConfig, setupHttpApp } from '@workspace/backend-core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  setupHttpApp(app, {
    enableCors: true,
  });

  const { port } = app.get<HttpConfig>(httpConfig.KEY);
  void (await app.listen(port));
}

void bootstrap();
