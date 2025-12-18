import { BullModule } from '@nestjs/bullmq';
import { Module, Global, DynamicModule } from '@nestjs/common';

import { JobDispatcherPort } from '@workspace/backend-ddd';
import { TaskQueueCode } from '@workspace/domain';

import { RedisConfig, redisConfig } from '../config';
import { CoreContextModule } from '../context';
import { JobDispatcher } from './job.dispatcher';
import { toSafeQueueName } from './task-queue.utils';

export interface TaskQueueOption {
  queue: {
    name: TaskQueueCode;
  };
}

@Global()
@Module({})
export class TaskQueueModule {
  static forRoot(): DynamicModule {
    return {
      module: TaskQueueModule,
      global: true, // 전역 모듈로 설정
      imports: [
        CoreContextModule,
        BullModule.forRootAsync({
          inject: [redisConfig.KEY],
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
        }),
      ],
      providers: [
        {
          provide: JobDispatcherPort,
          useClass: JobDispatcher,
        },
      ],
      exports: [BullModule, JobDispatcherPort],
    };
  }

  static forFeature(option: TaskQueueOption): DynamicModule {
    const bullModule = BullModule.registerQueue({
      name: toSafeQueueName(option.queue.name),
    });

    return {
      module: TaskQueueModule,
      imports: [bullModule],
      exports: [bullModule],
    };
  }
}
