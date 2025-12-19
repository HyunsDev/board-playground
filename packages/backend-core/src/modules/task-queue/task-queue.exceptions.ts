import { BaseInternalServerException } from '@workspace/backend-ddd';

export class TaskQueueNotFoundException extends BaseInternalServerException<
  'TaskQueueNotFound',
  {
    queueName: string;
  }
> {
  readonly code = 'TaskQueueNotFound';

  constructor(queueName: string, error?: unknown) {
    super(
      `Task queue not found: ${queueName}`,
      {
        queueName,
      },
      error,
    );
  }
}
