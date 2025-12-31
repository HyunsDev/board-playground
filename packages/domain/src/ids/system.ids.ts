import { brandedUuidSchema, type BrandId } from '@workspace/common';

export type FileId = BrandId<string, 'FileId'>;
export const asFileId = (value: string): FileId => value as FileId;
export const FileIdSchema = brandedUuidSchema<FileId>();

export type FileReferenceId = BrandId<string, 'FileReferenceId'>;
export const asFileReferenceId = (value: string): FileReferenceId => value as FileReferenceId;
export const FileReferenceIdSchema = brandedUuidSchema<FileReferenceId>();

export type AuditLogId = BrandId<string, 'AuditLogId'>;
export const asAuditLogId = (value: string): AuditLogId => value as AuditLogId;
export const AuditLogIdSchema = brandedUuidSchema<AuditLogId>();

export type SystemIdUnion = FileId | FileReferenceId | AuditLogId;
