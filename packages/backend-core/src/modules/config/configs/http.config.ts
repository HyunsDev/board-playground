import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const httpConfigSchema = z.object({
  PORT: z.coerce.number().int().positive(),
  COOKIE_SECRET: z.string().min(32),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION_TIME: z.string().prefault('15m'),
});

export const httpConfig = registerAs('http', () => {
  const parsed = httpConfigSchema.parse(process.env);
  return {
    port: parsed.PORT,
    cookieSecret: parsed.COOKIE_SECRET,

    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    jwtAccessExpirationTime: parsed.JWT_ACCESS_EXPIRATION_TIME,
  };
});

export type HttpConfig = ConfigType<typeof httpConfig>;
