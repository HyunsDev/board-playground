import { BullModule } from '@nestjs/bullmq';
import { Module, Global, DynamicModule, Scope } from '@nestjs/common';

import { AbstractJobDispatcherPort } from '@workspace/backend-ddd';
import { TaskQueueCode } from '@workspace/domain';

import { RedisConfig, redisConfig } from '../config';
import { JobDispatcher } from './job.dispatcher';
import { QueueRegistry } from './queue.registry';
import { toSafeQueueName } from './task-queue.utils';
import { CoreContextModule } from '../context/context.module';

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
        QueueRegistry,
        {
          provide: AbstractJobDispatcherPort,
          useClass: JobDispatcher,
          scope: Scope.REQUEST,
        },
      ],
      exports: [BullModule, AbstractJobDispatcherPort],
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
