import z from 'zod';

import { authContract } from './auth/auth.contract';
import { boardContract } from './board/board.contracts';
import { commentContract } from './comment/comment.contracts';
import { deviceContract } from './device/device.contract';
import { DevtoolsContract } from './devtools/devtools.contract';
import { EXCEPTION } from './exception';
import { postContracts } from './post/post.contracts';
import { userContract, userForAdminContract } from './user/user.contracts';

import { c, toExceptionSchema } from '@/common';

export const contract = c.router(
  {
    admin: c.router({
      user: userForAdminContract,
    }),
    auth: authContract,
    device: deviceContract,
    user: userContract,
    board: boardContract,
    post: postContracts,
    comment: commentContract,

    devtools: DevtoolsContract,
  },
  {
    commonResponse: {
      401: z.union([
        toExceptionSchema(EXCEPTION.AUTH.EXPIRED_TOKEN),
        toExceptionSchema(EXCEPTION.AUTH.INVALID_TOKEN),
        toExceptionSchema(EXCEPTION.AUTH.MISSING_TOKEN),
        toExceptionSchema(EXCEPTION.AUTH.UNAUTHORIZED),
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
