import { brandedStringSchema, brandedUuidSchema, type Brand } from '@workspace/common';

export type BoardId = Brand<string, 'BoardId'>;
export const asBoardId = (value: string): BoardId => value as BoardId;
export const BoardIdSchema = brandedUuidSchema<BoardId>();

export type BoardSlug = Brand<string, 'BoardSlug'>;
export const asBoardSlug = (value: string): BoardSlug => value as BoardSlug;
export const BoardSlugSchema = brandedStringSchema<BoardSlug>();

export type CommentId = Brand<string, 'CommentId'>;
export const asCommentId = (value: string): CommentId => value as CommentId;
export const CommentIdSchema = brandedUuidSchema<CommentId>();

export type ManagerId = Brand<string, 'ManagerId'>;
export const asManagerId = (value: string): ManagerId => value as ManagerId;
export const ManagerIdSchema = brandedUuidSchema<ManagerId>();

export type PostId = Brand<string, 'PostId'>;
export const asPostId = (value: string): PostId => value as PostId;
export const PostIdSchema = brandedUuidSchema<PostId>();

export type RefreshTokenId = Brand<string, 'RefreshTokenId'>;
export const asRefreshTokenId = (value: string): RefreshTokenId => value as RefreshTokenId;
export const RefreshTokenIdSchema = brandedUuidSchema<RefreshTokenId>();

export type SessionId = Brand<string, 'SessionId'>;
export const asSessionId = (value: string): SessionId => value as SessionId;
export const SessionIdSchema = brandedUuidSchema<SessionId>();
