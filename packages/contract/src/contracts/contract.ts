import { c } from 'common';

import { userContract } from './user';

export const contract = c.router({
  user: userContract,
});
