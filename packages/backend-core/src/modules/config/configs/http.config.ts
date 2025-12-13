import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const httpConfigSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  COOKIE_SECRET: z.string().min(32),
});

export const httpConfig = registerAs('http', () => {
  const parsed = httpConfigSchema.parse(process.env);
  return {
    port: parsed.PORT,
    cookieSecret: parsed.COOKIE_SECRET,
  };
});

export type HttpConfig = ConfigType<typeof httpConfig>;
