import { ApiErrors } from './api-errors';
import { authContract } from './auth/auth.contract';
import { boardContract } from './board/board.contracts';
import { commentContract } from './comment/comment.contracts';
import { DevtoolsContract, DevtoolsSSEContract } from './devtools/devtools.contract';
import { postContract } from './post/post.contracts';
import { sessionContract } from './session/session.contract';
import { userContract, userForAdminContract } from './user/user.contracts';

import { c } from '@/internal/c';
import { e } from '@/internal/sse.utils';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

export const contract = c.router(
  {
    admin: c.router({
      user: userForAdminContract,
    }),
    auth: authContract,
    session: sessionContract,
    user: userContract,
    board: boardContract,
    post: postContract,
    comment: commentContract,

    devtools: DevtoolsContract,
  },
  {
    commonResponses: {
      ...toApiErrorResponses([
        ApiErrors.Auth.AccessTokenExpired,
        ApiErrors.Auth.AccessTokenInvalid,
        ApiErrors.Auth.AccessTokenMissing,
      ]),
    },
  },
);

export const sseContract = e.router({
  devtools: DevtoolsSSEContract,
});
