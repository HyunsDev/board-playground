import { BullModule } from '@nestjs/bullmq';
import { Module, Global, DynamicModule } from '@nestjs/common';

import { TaskQueueCode } from '@workspace/domain';

import { JobDispatcher } from './job.dispatcher';
import { QueueRegistry } from './queue.registry';
import { toSafeQueueName } from './task-queue.utils';

import { JobDispatcherPort } from '@/base/messages/ports/job.dispatcher.port';
import { RedisConfig, redisConfig } from '@/modules/foundation/config';

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
      global: true,
      imports: [
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
        QueueRegistry,
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
