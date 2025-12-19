import { DevtoolsSSEContract } from './devtools/devtools.sse-contract';

import { e } from '@/internal/sse.utils';

export const sseContract = e.router({
  devtools: DevtoolsSSEContract,
});
