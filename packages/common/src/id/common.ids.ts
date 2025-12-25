import { brandedUuidSchema, type Brand } from './brand.type';

export type UserId = Brand<string, 'UserId'>;
export const asUserId = (value: string): UserId => value as UserId;
export const UserIdSchema = brandedUuidSchema<UserId>();

export type FileId = Brand<string, 'FileId'>;
export const asFileId = (value: string): FileId => value as FileId;
export const FileIdSchema = brandedUuidSchema<FileId>();

export type FileReferenceId = Brand<string, 'FileReferenceId'>;
export const asFileReferenceId = (value: string): FileReferenceId => value as FileReferenceId;
export const FileReferenceIdSchema = brandedUuidSchema<FileReferenceId>();

export type AuditLogId = Brand<string, 'AuditLogId'>;
export const asAuditLogId = (value: string): AuditLogId => value as AuditLogId;
export const AuditLogIdSchema = brandedUuidSchema<AuditLogId>();
