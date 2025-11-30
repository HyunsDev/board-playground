import z from 'zod';

import { authContract } from './auth/auth.contract';
import { boardContract } from './board/board.contracts';
import { commentContract } from './comment/comment.contracts';
import { deviceContract } from './device/device.contract';
import { DevtoolsContract } from './devtools/devtools.contract';
import { postContracts } from './post/post.contracts';
import { userContract, userForAdminContract } from './user/user.contracts';

import { c } from '@/common';

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
    baseHeaders: z.object({
      'x-device-id': z.string().uuid().optional(),
      authorization: z
        .string()
        .regex(/^Bearer\s.+$/)
        .optional(),
    }),
  },
);
