import type { Brand } from '@workspace/common';

export type BoardId = Brand<string, 'BoardId'>;
export const asBoardId = (value: string): BoardId => value as BoardId;

export type BoardSlug = Brand<string, 'BoardSlug'>;
export const asBoardSlug = (value: string): BoardSlug => value as BoardSlug;

export type CommentId = Brand<string, 'CommentId'>;
export const asCommentId = (value: string): CommentId => value as CommentId;

export type ManagerId = Brand<string, 'ManagerId'>;
export const asManagerId = (value: string): ManagerId => value as ManagerId;

export type PostId = Brand<string, 'PostId'>;
export const asPostId = (value: string): PostId => value as PostId;

export type RefreshTokenId = Brand<string, 'RefreshTokenId'>;
export const asRefreshTokenId = (value: string): RefreshTokenId => value as RefreshTokenId;

export type SessionId = Brand<string, 'SessionId'>;
export const asSessionId = (value: string): SessionId => value as SessionId;
