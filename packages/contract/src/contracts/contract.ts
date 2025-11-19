import { c } from 'common';

import { boardContract } from './board';
import { userContract, userForAdminContract } from './user';

export const contract = c.router({
  admin: c.router({
    user: userForAdminContract,
  }),
  user: userContract,
  board: boardContract,
});
