import { c } from 'common';

import { userContract, userForAdminContract } from './user';

export const contract = c.router({
  admin: c.router({
    user: userForAdminContract,
  }),

  user: userContract,
});
