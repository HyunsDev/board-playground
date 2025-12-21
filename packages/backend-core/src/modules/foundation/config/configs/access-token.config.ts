import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const accessTokenConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION_TIME: z.string().prefault('15m'),
});

export const accessTokenConfig = registerAs('accessToken', () => {
  const parsed = accessTokenConfigSchema.parse(process.env);
  return {
    jwtAccessSecret: parsed.JWT_ACCESS_SECRET,
    jwtAccessExpirationTime: parsed.JWT_ACCESS_EXPIRATION_TIME,
  };
});

export type AccessTokenConfig = ConfigType<typeof accessTokenConfig>;
