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
  .min(1, 'Username must be at least 1 character.')
  .max(30, 'Username must be at most 30 characters.')
  .regex(/^[a-z0-9._]+$/, '영어 소문자, 숫자, 밑줄(_), 마침표(.)만 사용할 수 있어요')
  .refine((v) => !v.startsWith('.'), "'.'으로 시작할 수 없어요")
  .refine((v) => !v.endsWith('.'), "'.'으로 끝날 수 없어요")
  .refine((v) => !v.includes('..'), "'.'을 연속으로 쓸 수 없어요")
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
