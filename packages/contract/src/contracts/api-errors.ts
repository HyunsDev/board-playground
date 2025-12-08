import { AuthApiErrors } from './auth/auth.exceptions';
import { BoardApiErrors } from './board/board.exceptions';
import { CommentApiErrors } from './comment/comment.exceptions';
import { CommonApiErrors } from './common/common.exceptions';
import { ManagerApiErrors } from './manager/manager.exceptions';
import { PostApiErrors } from './post/post.exceptions';
import { SessionApiErrors } from './session/session.exceptions';
import { UserApiErrors } from './user/user.exceptions';

export const ApiErrors = {
  Common: CommonApiErrors,
  Auth: AuthApiErrors,
  Board: BoardApiErrors,
  Comment: CommentApiErrors,
  Session: SessionApiErrors,
  Manager: ManagerApiErrors,
  Post: PostApiErrors,
  User: UserApiErrors,
} as const;
