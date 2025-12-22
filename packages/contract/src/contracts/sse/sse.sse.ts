import z from 'zod';

import { e } from '@/internal/sse.utils';

export const PingSse = e.define({
  event: 'Ping',
  payload: z.object({}),
});
