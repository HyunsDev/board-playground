import { DevtoolsSSEContract } from './devtools/devtools.sse-contract';
import { SseSseContract } from './sse/sse.sse-contract';

import { e } from '@/internal/sse.utils';

export const sseContract = e.router({
  sse: SseSseContract,
  devtools: DevtoolsSSEContract,
});
