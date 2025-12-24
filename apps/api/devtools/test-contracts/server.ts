import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import { SilentLogger } from './utils';
import { TestContractsModule } from './test-contracts.module';

async function bootstrap() {
  const port = Number(process.env.TEST_CONTRACT_PORT ?? 4300);

  const app = await NestFactory.create<NestFastifyApplication>(
    TestContractsModule,
    new FastifyAdapter(),
    { logger: new SilentLogger() },
  );

  await app.listen(port, '0.0.0.0');

  // eslint-disable-next-line no-console
  console.log(`Test contract viewer running at http://localhost:${port}`);
}

void bootstrap();
