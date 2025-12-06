import z from 'zod';

import { SessionDtoSchema } from './session.dto';

import { c, toApiErrorResponses } from '@/common';
import { ACCESS } from '@/common/access';
import { EXCEPTION } from '@/contracts/exception';

export const getSession = c.query({
  method: 'GET',
  path: '/sessions/:sessionId',
  pathParams: z.object({
    sessionId: z.string().uuid(),
  }),
  responses: {
    200: z.object({
      session: SessionDtoSchema,
    }),
    ...toApiErrorResponses([EXCEPTION.SESSION.NOT_FOUND]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const listSessions = c.query({
  method: 'GET',
  path: '/sessions',
  responses: {
    200: z.object({
      sessions: z.array(SessionDtoSchema),
    }),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});

export const deleteSession = c.mutation({
  method: 'DELETE',
  path: '/sessions/:sessionId',
  body: c.noBody(),
  pathParams: z.object({
    sessionId: z.string().uuid(),
  }),
  responses: {
    204: z.undefined(),
    ...toApiErrorResponses([EXCEPTION.SESSION.NOT_FOUND]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
