import z from 'zod';

import { brandedUuidSchema, type BrandId } from '@workspace/common';

export type BoardId = BrandId<string, 'BoardId'>;
export const asBoardId = (value: string): BoardId => value as BoardId;
export const BoardIdSchema = brandedUuidSchema<BoardId>();

export type BoardSlug = BrandId<string, 'BoardSlug'>;
export const asBoardSlug = (value: string): BoardSlug => value as BoardSlug;
export const BoardSlugSchema = z
  .string()
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug format')
  .min(2)
  .max(20)
  .transform((val) => val as BoardSlug);

export type CommentId = BrandId<string, 'CommentId'>;
export const asCommentId = (value: string): CommentId => value as CommentId;
export const CommentIdSchema = brandedUuidSchema<CommentId>();

export type ManagerId = BrandId<string, 'ManagerId'>;
export const asManagerId = (value: string): ManagerId => value as ManagerId;
export const ManagerIdSchema = brandedUuidSchema<ManagerId>();

export type PostId = BrandId<string, 'PostId'>;
export const asPostId = (value: string): PostId => value as PostId;
export const PostIdSchema = brandedUuidSchema<PostId>();

export type CommunityIdUnion = BoardId | BoardSlug | CommentId | ManagerId | PostId;
