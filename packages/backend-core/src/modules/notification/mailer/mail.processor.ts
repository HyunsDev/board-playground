import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { SendMailJobHandler } from './send-mail.job';

import { CoreContext } from '@/modules/foundation';
import { JobProcessor, Processor } from '@/modules/messaging';

@Processor(TaskQueueCodeEnum.System.Mail)
export class MailProcessor extends JobProcessor {
  constructor(
    readonly coreContext: CoreContext,
    readonly logger: Logger,
    readonly sendMailJobHandler: SendMailJobHandler,
  ) {
    super(coreContext, logger, [sendMailJobHandler]);
  }
}
