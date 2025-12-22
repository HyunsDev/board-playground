import { Logger } from '@nestjs/common';

import { TaskQueueCodeEnum } from '@workspace/domain';

import { SendMailJobHandler } from './send-mail.job';

import { CoreContext } from '@/modules/foundation';
import { JobProcessor, Processor } from '@/modules/messaging';

@Processor(TaskQueueCodeEnum.System.Mail)
export class MailProcessor extends JobProcessor {
  logger = new Logger(MailProcessor.name);

  constructor(
    readonly coreContext: CoreContext,
    readonly sendMailJobHandler: SendMailJobHandler,
  ) {
    const logger = new Logger(MailProcessor.name);
    super(coreContext, logger, [sendMailJobHandler]);
    this.logger = logger;
  }
}
