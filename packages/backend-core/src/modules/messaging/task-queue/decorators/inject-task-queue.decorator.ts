// packages/backend-core/src/modules/task-queue/decorators/inject-task-queue.decorator.ts

import { InjectQueue } from '@nestjs/bullmq';

import { TaskQueueCode } from '@workspace/domain';

import { toSafeQueueName } from '../task-queue.utils';

export const InjectTaskQueue = (code: TaskQueueCode) => {
  return InjectQueue(toSafeQueueName(code));
};
