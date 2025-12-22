import { Inject, Injectable, Logger } from '@nestjs/common';
import { err, ok } from 'neverthrow';
import * as nodemailer from 'nodemailer';

import { MailerConfig, mailerConfig } from '@/modules/foundation/config/configs/mailer.config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailerConfig.KEY)
    private readonly config: MailerConfig,
  ) {
    // OAuth2 설정
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Google Workspace/Gmail 사용 시 편리한 단축 설정
      auth: {
        type: 'OAuth2',
        user: this.config.mailUser,
        clientId: this.config.mailClientId,
        clientSecret: this.config.mailClientSecret,
        refreshToken: this.config.mailRefreshToken,
      },
    } as nodemailer.TransportOptions);
  }

  async sendEmail(options: nodemailer.SendMailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: this.config.mailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return ok(info);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return err(error as Error);
    }
  }
}
