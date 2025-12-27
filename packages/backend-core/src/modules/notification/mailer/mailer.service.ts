import { Inject, Injectable, Logger } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import * as nodemailer from 'nodemailer';

import { FailedToSendMailError } from './mailer.errors';

import { MailerConfig, mailerConfig } from '@/modules/foundation/config/configs/mailer.config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailerConfig.KEY)
    private readonly config: MailerConfig,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: this.config.mailUser,
        clientId: this.config.mailClientId,
        clientSecret: this.config.mailClientSecret,
        refreshToken: this.config.mailRefreshToken,
      },
    } as nodemailer.TransportOptions);
  }

  sendEmail(options: nodemailer.SendMailOptions) {
    return ResultAsync.fromPromise(
      this.transporter.sendMail({
        from: this.config.mailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
      (e) => {
        this.logger.error(`Failed to send email to ${options.to}`, e);
        return new FailedToSendMailError(options, e);
      },
    );
  }
}
