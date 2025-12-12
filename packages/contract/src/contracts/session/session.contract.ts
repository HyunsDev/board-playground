import { deleteSession, getSession, listSessions } from './session.endpoints';

import { c } from '@/internal/c';

export const sessionContract = c.router({
  get: getSession,
  list: listSessions,
  delete: deleteSession,
});
