import { c } from 'common';

import { authContract } from './auth/auth.contract';
import { boardContract } from './board';
import { commentContract } from './comment';
import { deviceContract } from './device';
import { postContracts } from './post';
import { userContract, userForAdminContract } from './user';

export const contract = c.router({
  admin: c.router({
    user: userForAdminContract,
  }),
  auth: authContract,
  device: deviceContract,
  user: userContract,
  board: boardContract,
  post: postContracts,
  comment: commentContract,
});
