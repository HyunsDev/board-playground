import { Injectable } from '@nestjs/common';

import { SendMailOptions } from './mailer.types';
import { SendMailJob } from './send-mail.job';

import { JobDispatcherPort } from '@/base';

@Injectable()
export class MailPublisher {
  constructor(private readonly jobDispatcher: JobDispatcherPort) {}

  async send(options: SendMailOptions) {
    return await this.jobDispatcher.dispatch(new SendMailJob(null, options));
  }
}
