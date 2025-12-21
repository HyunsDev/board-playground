import z from 'zod';

export const FILE_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  FAILED: 'FAILED',
  DELETED: 'DELETED',
  ORPHANED: 'ORPHANED',
} as const;
export const FileStatus = z.enum(FILE_STATUS);
export type FileStatus = z.infer<typeof FileStatus>;

export const FILE_ACCESS_TYPE = {
  PRIVATE: 'PRIVATE',
  PUBLIC: 'PUBLIC',
} as const;
export const FileAccessType = z.enum(FILE_ACCESS_TYPE);
export type FileAccessType = z.infer<typeof FileAccessType>;
