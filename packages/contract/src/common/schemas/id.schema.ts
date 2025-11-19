import z from 'zod';

export const ID = z.uuid();
export type ID = z.infer<typeof ID>;
