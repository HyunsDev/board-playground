import { type Brand } from './brand.type';

export type UserId = Brand<string, 'UserId'>;
export const asUserId = (value: string): UserId => value as UserId;

export type FileId = Brand<string, 'FileId'>;
export const asFileId = (value: string): FileId => value as FileId;

export type FileReferenceId = Brand<string, 'FileReferenceId'>;
export const asFileReferenceId = (value: string): FileReferenceId => value as FileReferenceId;

export type AuditLogId = Brand<string, 'AuditLogId'>;
export const asAuditLogId = (value: string): AuditLogId => value as AuditLogId;
