import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const cookieConfigSchema = z.object({
  COOKIE_SECRET: z.string().min(32),
});

export const cookieConfig = registerAs('cookie', () => {
  const parsed = cookieConfigSchema.parse(process.env);
  return {
    cookieSecret: parsed.COOKIE_SECRET,
  };
});

export type CookieConfig = ConfigType<typeof cookieConfig>;
