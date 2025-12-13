import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const redisConfigSchema = z.object({
  REDIS_HOST: z.string().min(1),
  REDIS_PORT: z.coerce.number().int().positive(),
  REDIS_PASSWORD: z.string().min(1).optional(),
});

export const redisConfig = registerAs('redis', () => {
  const parsed = redisConfigSchema.parse(process.env);
  return {
    redisHost: parsed.REDIS_HOST,
    redisPort: parsed.REDIS_PORT,
    redisPassword: parsed.REDIS_PASSWORD,
  };
});
export type RedisConfig = ConfigType<typeof redisConfig>;
