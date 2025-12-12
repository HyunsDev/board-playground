import { ConfigType, registerAs } from '@nestjs/config';
import z from 'zod';

const refreshTokenConfigSchema = z.object({
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRATION_DAYS: z.coerce.number().int().positive().default(30),
});

export const refreshTokenConfig = registerAs('refreshToken', () => {
  const parsed = refreshTokenConfigSchema.parse(process.env);
  return {
    refreshTokenSecret: parsed.REFRESH_TOKEN_SECRET,
    refreshTokenExpirationDays: parsed.REFRESH_TOKEN_EXPIRATION_DAYS,
  };
});

export type RefreshTokenConfig = ConfigType<typeof refreshTokenConfig>;
