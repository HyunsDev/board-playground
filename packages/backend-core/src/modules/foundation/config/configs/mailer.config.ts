import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

export const mailerConfigSchema = z.object({
  MAIL_USER: z.email(),
  MAIL_CLIENT_ID: z.string(),
  MAIL_CLIENT_SECRET: z.string(),
  MAIL_REFRESH_TOKEN: z.string(),
  MAIL_FROM: z.string().min(5),
});

export const mailerConfig = registerAs('mailer', () => {
  const parsed = mailerConfigSchema.parse(process.env);
  return {
    mailUser: parsed.MAIL_USER,
    mailClientId: parsed.MAIL_CLIENT_ID,
    mailClientSecret: parsed.MAIL_CLIENT_SECRET,
    mailRefreshToken: parsed.MAIL_REFRESH_TOKEN,
    mailFrom: parsed.MAIL_FROM,
  };
});

export type MailerConfig = ConfigType<typeof mailerConfig>;
