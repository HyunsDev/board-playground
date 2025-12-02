import { AUTH_EXCEPTION } from './auth/auth.exceptions';
import { BOARD_EXCEPTION } from './board/board.exceptions';
import { COMMENT_EXCEPTION } from './comment/comment.exceptions';
import { COMMON_EXCEPTION } from './common/common.exceptions';
import { DEVICE_EXCEPTION } from './device/device.exceptions';
import { MANAGER_EXCEPTION } from './manager/manager.exceptions';
import { POST_EXCEPTION } from './post/post.exceptions';
import { USER_EXCEPTION } from './user/user.exceptions';

export const EXCEPTION = {
  AUTH: AUTH_EXCEPTION,
  BOARD: BOARD_EXCEPTION,
  COMMENT: COMMENT_EXCEPTION,
  COMMON: COMMON_EXCEPTION,
  DEVICE: DEVICE_EXCEPTION,
  MANAGER: MANAGER_EXCEPTION,
  POST: POST_EXCEPTION,
  USER: USER_EXCEPTION,
} as const;
