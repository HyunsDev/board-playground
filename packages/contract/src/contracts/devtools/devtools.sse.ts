import z from 'zod';

import { e } from '@/internal/sse.utils';

export const TestPublishedSSE = e.define({
  code: 'TestPublished',
  payload: z.object({
    userId: z.uuid(),
  }),
});
