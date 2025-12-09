import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

const databaseConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export const databaseConfig = registerAs('database', () => {
  const parsed = databaseConfigSchema.parse(process.env);
  return {
    databaseUrl: parsed.DATABASE_URL,
  };
});

export type DatabaseConfig = ConfigType<typeof databaseConfig>;
