import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

export const prismaConfigSchema = z.object({
  DATABASE_URL: z.url(),
});

export const prismaConfig = registerAs('prisma', () => {
  const parsed = prismaConfigSchema.parse(process.env);
  return {
    databaseUrl: parsed.DATABASE_URL,
  };
});
export type PrismaConfig = ConfigType<typeof prismaConfig>;
