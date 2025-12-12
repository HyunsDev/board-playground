import z from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedQueryOf = <T extends z.ZodTypeAny>(schema: T) => {
  return schema.and(paginationQuerySchema);
};

export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  take: z.number().int().min(1).max(100),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const paginatedResponseOf = <T extends z.ZodTypeAny>(itemSchema: T) => {
  return z.object({
    items: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
};

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
