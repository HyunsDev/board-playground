import { ACCESS } from '@/common';
import { c } from '@/internal/c';

export const streamingSse = c.query({
  method: 'GET',
  path: '/sse/stream',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});
