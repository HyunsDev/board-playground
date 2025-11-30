import { createUserForDev, forceLoginForDev } from './devtools.endpoints';

import { c } from '@/common';

export const DevtoolsContract = c.router({
  createUser: createUserForDev,
  forceLogin: forceLoginForDev,
});
