import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('4000'),
  DATABASE_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRATION_TIME: z.string().default('15m'),

  COOKIE_SECRET: z.string().min(32),
});

export type EnvSchema = z.infer<typeof envSchema>;
