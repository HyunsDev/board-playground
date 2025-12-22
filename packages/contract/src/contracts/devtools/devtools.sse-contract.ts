import { TestPublishedSse } from './devtools.sse';

import { e } from '@/internal/sse.utils';

export const DevtoolsSSEContract = e.router({
  TestPublished: TestPublishedSse,
});
