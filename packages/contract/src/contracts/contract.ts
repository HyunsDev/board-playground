import { c } from 'common';

import { boardContract } from './board';
import { commentContract } from './comment';
import { postContracts } from './post';
import { userContract, userForAdminContract } from './user';
import { authContract } from './auth/auth.contract';

export const contract = c.router({
  admin: c.router({
    user: userForAdminContract,
  }),
  auth: authContract,
  user: userContract,
  board: boardContract,
  post: postContracts,
  comment: commentContract,
});
