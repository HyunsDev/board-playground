import { ACCESS } from '@/common';
import { c } from '@/internal/c';

export const authSse = c.mutation({
  method: 'POST',
  path: '/sse/auth',
  description: 'SSE 연결을 위해 쿠키로 1회용 토큰을 발급합니다',
  body: c.noBody(),
  responses: {
    204: c.noBody(),
  },
  metadata: {
    ...ACCESS.signedIn,
  },
});

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
