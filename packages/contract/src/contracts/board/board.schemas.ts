import { z } from 'zod';

export const BoardSlug = z
  .string()
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug format')
  .min(2)
  .max(20);
export type BoardSlug = z.infer<typeof BoardSlug>;
