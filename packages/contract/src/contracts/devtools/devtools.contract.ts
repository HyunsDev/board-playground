import { forceRegisterForDev, forceLoginForDev } from './devtools.endpoints';

import { c } from '@/common';

export const DevtoolsContract = c.router({
  forceRegister: forceRegisterForDev,
  forceLogin: forceLoginForDev,
});
