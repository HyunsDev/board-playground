import { AUTH_EXCEPTION } from './auth';
import { BOARD_EXCEPTION } from './board';
import { COMMENT_EXCEPTION } from './comment';
import { COMMON_EXCEPTION } from './common';
import { DEVICE_EXCEPTION } from './device';
import { MANAGER_EXCEPTION } from './manager';
import { POST_EXCEPTION } from './post';
import { USER_EXCEPTION } from './user';

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
