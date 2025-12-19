import { forceRegisterForDev, forceLoginForDev, resetDBForDev } from './devtools.endpoints';
import { TestPublishedSSE } from './devtools.sse';

import { c } from '@/internal/c';
import { e } from '@/internal/sse.utils';

export const DevtoolsContract = c.router({
  forceRegister: forceRegisterForDev,
  forceLogin: forceLoginForDev,
  resetDB: resetDBForDev,
});

export const DevtoolsSSEContract = e.router({
  TestPublished: TestPublishedSSE,
});
