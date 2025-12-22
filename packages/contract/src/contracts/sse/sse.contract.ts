import { streamingSse } from './sse.endpoint';

import { c } from '@/internal/c';

export const sseContract = c.router({
  streaming: streamingSse,
});
