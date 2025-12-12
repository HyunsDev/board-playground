import { z } from 'zod';

// ----------------------------------------------------------------------
// Pagination Query
// ----------------------------------------------------------------------

export const paginationOptionsSchema = z.object({
  page: z.coerce.number().int().min(1).prefault(1),
  limit: z.coerce.number().int().min(1).max(100).prefault(20),
});
export type PaginationOptions = z.infer<typeof paginationOptionsSchema>;

export type PaginationQuery<T> = T & {
  page: number;
  limit: number;
};

// ----------------------------------------------------------------------
// Pagination Result
// ----------------------------------------------------------------------

export const paginationMetadataSchema = z.object({
  page: z.int().min(1),
  limit: z.int().min(1),
  totalItems: z.int().min(0),
  totalPages: z.int().min(0),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});
export type PaginationMetadata = z.infer<typeof paginationMetadataSchema>;

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMetadata;
}
