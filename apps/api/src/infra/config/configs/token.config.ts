import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const tokenConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION_TIME: z.string().default('15m'),

  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRATION_DAYS: z.coerce.number().int().positive().default(30),
});

export const tokenConfig = registerAs('token', () => {
  const parsed = tokenConfigSchema.parse(process.env);
  return {
    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    jwtAccessExpirationTime: parsed.JWT_ACCESS_EXPIRATION_TIME,
    refreshTokenSecret: parsed.REFRESH_TOKEN_SECRET,
    refreshTokenExpirationDays: parsed.REFRESH_TOKEN_EXPIRATION_DAYS,
  };
});

export type TokenConfig = ConfigType<typeof tokenConfig>;
