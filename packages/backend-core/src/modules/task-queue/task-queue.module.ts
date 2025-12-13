import { BullModule } from '@nestjs/bullmq';
import { Module, Global } from '@nestjs/common';

import { RedisConfig, redisConfig } from '../config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: async (config: RedisConfig) => ({
        connection: {
          host: config.redisHost,
          port: config.redisPort,
          password: config.redisPassword,
        },
        prefix: '{bull}',
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      }),
      inject: [redisConfig.KEY],
    }),
  ],
  exports: [BullModule],
})
export class TaskQueueModule {}
