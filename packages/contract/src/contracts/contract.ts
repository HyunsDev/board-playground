import z from 'zod';

import { authContract } from './auth/auth.contract';
import { boardContract } from './board/board.contracts';
import { commentContract } from './comment/comment.contracts';
import { DevtoolsContract } from './devtools/devtools.contract';
import { ApiErrors } from './api-errors';
import { postContracts } from './post/post.contracts';
import { sessionContract } from './session/session.contract';
import { userContract, userForAdminContract } from './user/user.contracts';

import { c, toApiErrorResponses } from '@/common';

export const contract = c.router(
  {
    admin: c.router({
      user: userForAdminContract,
    }),
    auth: authContract,
    session: sessionContract,
    user: userContract,
    board: boardContract,
    post: postContracts,
    comment: commentContract,

    devtools: DevtoolsContract,
  },
  {
    commonResponse: {
      ...toApiErrorResponses([
        ApiErrors.Auth.AccessTokenExpired,
        ApiErrors.Auth.AccessTokenInvalid,
        ApiErrors.Auth.AccessTokenMissing,
      ]),
    },
    baseHeaders: z.object({
      'x-device-id': z.string().uuid().optional(),
      authorization: z
        .string()
        .regex(/^Bearer\s.+$/)
        .optional(),
    }),
  },
);
