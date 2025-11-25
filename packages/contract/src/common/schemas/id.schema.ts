import z from 'zod';

export const ID = z.string().uuid();
export type ID = z.infer<typeof ID>;
