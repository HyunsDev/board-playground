import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const coreConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).prefault('development'),
  USE_LOCAL_LOKI: z.string().default('false'),
});

export const coreConfig = registerAs('core', () => {
  const parsed = coreConfigSchema.parse(process.env);
  return {
    nodeEnv: parsed.NODE_ENV,
    isProduction: parsed.NODE_ENV === 'production',
    isDevelopment: parsed.NODE_ENV === 'development',
    isTest: parsed.NODE_ENV === 'test',
    useLocalLoki: parsed.USE_LOCAL_LOKI === 'true',
  };
});
export type CoreConfig = ConfigType<typeof coreConfig>;
