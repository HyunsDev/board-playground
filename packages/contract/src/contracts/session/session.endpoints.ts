import z from 'zod';

import { SessionDtoSchema } from './session.dto';

import { ACCESS } from '@/common/access';
import { ApiErrors } from '@/contracts/api-errors';
import { c } from '@/internal/c';
import { toApiErrorResponses } from '@/internal/utils/to-api-error-responses';

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
    ...toApiErrorResponses([ApiErrors.Session.NotFound]),
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
    ...toApiErrorResponses([ApiErrors.Session.NotFound]),
  },
  metadata: {
    access: ACCESS.signedIn,
  },
});
