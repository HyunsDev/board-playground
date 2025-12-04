import { AUTH_EXCEPTION } from './auth/auth.exceptions';
import { BOARD_EXCEPTION } from './board/board.exceptions';
import { COMMENT_EXCEPTION } from './comment/comment.exceptions';
import { COMMON_EXCEPTION } from './common/common.exceptions';
import { MANAGER_EXCEPTION } from './manager/manager.exceptions';
import { POST_EXCEPTION } from './post/post.exceptions';
import { SESSION_EXCEPTION } from './session/session.exceptions';
import { USER_EXCEPTION } from './user/user.exceptions';

export const EXCEPTION = {
  COMMON: COMMON_EXCEPTION,

  AUTH: AUTH_EXCEPTION,
  BOARD: BOARD_EXCEPTION,
  COMMENT: COMMENT_EXCEPTION,
  SESSION: SESSION_EXCEPTION,
  MANAGER: MANAGER_EXCEPTION,
  POST: POST_EXCEPTION,
  USER: USER_EXCEPTION,
} as const;
