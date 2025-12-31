import z from 'zod';

import { brandedUuidSchema, type BrandId } from '@workspace/common';

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

export type EmailVerificationCode = BrandId<string, 'EmailVerificationCode'>;
export const asEmailVerificationCode = (value: string): EmailVerificationCode =>
  value as EmailVerificationCode;
export const EmailVerificationCodeSchema = z
  .string()
  .length(6)
  .transform((val) => val as EmailVerificationCode);

export type PasswordResetCode = BrandId<string, 'PasswordResetCode'>;
export const asPasswordResetCode = (value: string): PasswordResetCode => value as PasswordResetCode;
export const PasswordResetCodeSchema = brandedUuidSchema<PasswordResetCode>();

export type RefreshTokenId = BrandId<string, 'RefreshTokenId'>;
export const asRefreshTokenId = (value: string): RefreshTokenId => value as RefreshTokenId;
export const RefreshTokenIdSchema = brandedUuidSchema<RefreshTokenId>();

export type SessionId = BrandId<string, 'SessionId'>;
export const asSessionId = (value: string): SessionId => value as SessionId;
export const SessionIdSchema = brandedUuidSchema<SessionId>();

export type AccountIdUnion =
  | UserId
  | UserEmail
  | Username
  | EmailVerificationCode
  | PasswordResetCode
  | RefreshTokenId
  | SessionId;
