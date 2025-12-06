import { forceRegisterForDev, forceLoginForDev, resetDBForDev } from './devtools.endpoints';

import { c } from '@/common';

export const DevtoolsContract = c.router({
  forceRegister: forceRegisterForDev,
  forceLogin: forceLoginForDev,
  resetDB: resetDBForDev,
});
