import z from 'zod';

import { authContract } from './auth/auth.contract';
import { boardContract } from './board/board.contracts';
import { commentContract } from './comment/comment.contracts';
import { DevtoolsContract } from './devtools/devtools.contract';
import { EXCEPTION } from './exception';
import { postContracts } from './post/post.contracts';
import { sessionContract } from './session/session.contract';
import { userContract, userForAdminContract } from './user/user.contracts';

import { c, toExceptionSchema } from '@/common';

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
      401: z.union([
        toExceptionSchema(EXCEPTION.AUTH.ACCESS_TOKEN_EXPIRED),
        toExceptionSchema(EXCEPTION.AUTH.ACCESS_TOKEN_INVALID),
        toExceptionSchema(EXCEPTION.AUTH.ACCESS_TOKEN_MISSING),
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
