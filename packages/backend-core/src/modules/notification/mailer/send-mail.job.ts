import { asJobCode, DomainCodeEnums, TaskQueueCodeEnum } from '@workspace/domain';

import { MailerService } from './mailer.service';
import { SendMailOptions, SendMailOptionsSchema } from './mailer.types';

import { BaseJob, BaseJobProps, IJobHandler } from '@/base';
import { JobHandler } from '@/modules/messaging';

export type SendMailJobProps = BaseJobProps<SendMailOptions>;

export class SendMailJob extends BaseJob<SendMailJobProps> {
  static readonly code = asJobCode('system:notification:job:send_mail');
  readonly queueName = TaskQueueCodeEnum.System.Mail;
  readonly resourceType = DomainCodeEnums.System.Notification;
  get schema() {
    return SendMailOptionsSchema;
  }
}

@JobHandler(SendMailJob)
export class SendMailJobHandler implements IJobHandler<SendMailJob> {
  constructor(private readonly mailerService: MailerService) {}

  async execute(job: SendMailJob) {
    const { to, subject, html, text } = job.data;
    const result = await this.mailerService.sendEmail({ to, subject, html, text });
    return result.map(() => undefined);
  }
}
