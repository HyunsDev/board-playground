import z from 'zod';

import { e } from '@/internal/sse.utils';

export const TestPublishedSse = e.define({
  event: 'TestPublished',
  payload: z.object({
    userId: z.uuid(),
  }),
});
