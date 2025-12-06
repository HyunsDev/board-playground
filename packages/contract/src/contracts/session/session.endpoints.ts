import z from 'zod';

import { SessionDtoSchema } from './session.dto';

import { c } from '@/common';
import { accessRole } from '@/common/utils/access.utils';
import { toExceptionSchema } from '@/common/utils/toExceptionSchema';
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
    404: toExceptionSchema(EXCEPTION.SESSION.NOT_FOUND),
  },
  metadata: {
    ...accessRole.signedIn(),
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
    ...accessRole.signedIn(),
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
    404: toExceptionSchema(EXCEPTION.SESSION.NOT_FOUND),
  },
  metadata: {
    ...accessRole.signedIn(),
  },
});
