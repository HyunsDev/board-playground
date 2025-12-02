import { deleteSession, getSession, listSessions } from './session.endpoints';

import { c } from '@/common';

export const sessionContract = c.router({
  get: getSession,
  list: listSessions,
  delete: deleteSession,
});
