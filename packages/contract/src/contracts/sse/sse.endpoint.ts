import { ACCESS } from '@/common';
import { c } from '@/internal/c';

export const streamingSse = c.mutation({
  method: 'POST',
  path: '/sse/stream',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});
