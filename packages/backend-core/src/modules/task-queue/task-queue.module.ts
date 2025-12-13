import { BullModule } from '@nestjs/bullmq';
import { Module, Global } from '@nestjs/common';

import { JobDispatcherPort } from '@workspace/backend-ddd';

import { RedisConfig, redisConfig } from '../config';
import { CoreContextModule } from '../context';
import { JobDispatcher } from './job.dispatcher';

@Global()
@Module({
  imports: [
    CoreContextModule,
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
  providers: [
    {
      provide: JobDispatcherPort,
      useClass: JobDispatcher,
    },
  ],
  exports: [BullModule, JobDispatcherPort],
})
export class TaskQueueModule {}
