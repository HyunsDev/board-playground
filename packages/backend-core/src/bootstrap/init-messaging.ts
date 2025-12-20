import { INestApplication, Logger } from '@nestjs/common';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

import { redisConfig, RedisConfig } from '@/modules';

export async function initMessaging(app: INestApplication) {
  const logger = new Logger('initMessaging');

  const config = app.get<RedisConfig>(redisConfig.KEY);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config.redisHost,
      port: config.redisPort,
      password: config.redisPassword,
    },
  });

  await app.startAllMicroservices();

  logger.log('Microservice (Redis) connected');
}
