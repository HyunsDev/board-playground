import { AuthApiErrors } from './auth/auth.errors';
import { BoardApiErrors } from './board/board.errors';
import { CommentApiErrors } from './comment/comment.errors';
import { CommonApiErrors } from './common/common.errors';
import { ManagerApiErrors } from './manager/manager.errors';
import { PostApiErrors } from './post/post.errors';
import { SessionApiErrors } from './session/session.errors';
import { UserApiErrors } from './user/user.errors';

import { defineApiErrors } from '@/internal/utils/define-api-errors.utils';

export const ApiErrors = defineApiErrors({
  Common: CommonApiErrors,
  Auth: AuthApiErrors,
  Board: BoardApiErrors,
  Comment: CommentApiErrors,
  Session: SessionApiErrors,
  Manager: ManagerApiErrors,
  Post: PostApiErrors,
  User: UserApiErrors,
});
