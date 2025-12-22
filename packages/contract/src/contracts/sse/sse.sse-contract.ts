import { PingSse } from './sse.sse';

import { e } from '@/internal/sse.utils';

export const SseSseContract = e.router({
  Ping: PingSse,
});
