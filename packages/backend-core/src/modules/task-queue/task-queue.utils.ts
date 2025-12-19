import { TaskQueueCode } from '@workspace/domain';

export const toSafeQueueName = (code: TaskQueueCode): string => {
  return code.replace(/:/g, '_');
};

export const fromSafeQueueName = (safeName: string): TaskQueueCode => {
  return safeName.replace(/_/g, ':') as TaskQueueCode;
};
