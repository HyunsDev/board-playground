import z from 'zod';

import { brandedUuidSchema, type BrandId } from './brand.type';

export type UserId = BrandId<string, 'UserId'>;
export const asUserId = (value: string): UserId => value as UserId;
export const UserIdSchema = brandedUuidSchema<UserId>();

export type UserEmail = BrandId<string, 'UserEmail'>;
export const asUserEmail = (value: string): UserEmail => value as UserEmail;
export const UserEmailSchema = z.email().transform((val) => val as UserEmail);

export type Username = BrandId<string, 'Username'>;
export const asUsername = (value: string): Username => value as Username;
export const UsernameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform((val) => val as Username);

export type FileId = BrandId<string, 'FileId'>;
export const asFileId = (value: string): FileId => value as FileId;
export const FileIdSchema = brandedUuidSchema<FileId>();

export type FileReferenceId = BrandId<string, 'FileReferenceId'>;
export const asFileReferenceId = (value: string): FileReferenceId => value as FileReferenceId;
export const FileReferenceIdSchema = brandedUuidSchema<FileReferenceId>();

export type AuditLogId = BrandId<string, 'AuditLogId'>;
export const asAuditLogId = (value: string): AuditLogId => value as AuditLogId;
export const AuditLogIdSchema = brandedUuidSchema<AuditLogId>();

export type CoreId = UserId | FileId | FileReferenceId | AuditLogId;
