import { registerAs, ConfigType } from '@nestjs/config';
import z from 'zod';

export const executionConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
});
export const executionConfig = registerAs('execution', () => {
  const parsed = executionConfigSchema.parse(process.env);
  return {
    nodeEnv: parsed.NODE_ENV,
    port: parsed.PORT,
  };
});

export type ExecutionConfig = ConfigType<typeof executionConfig>;
