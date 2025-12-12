import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const coreConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
});

export const coreConfig = registerAs('core', () => {
  const parsed = coreConfigSchema.parse(process.env);
  return {
    nodeEnv: parsed.NODE_ENV,
    databaseUrl: parsed.DATABASE_URL,
    isProduction: parsed.NODE_ENV === 'production',
    isDevelopment: parsed.NODE_ENV === 'development',
    isTest: parsed.NODE_ENV === 'test',
  };
});
export type CoreConfig = ConfigType<typeof coreConfig>;
