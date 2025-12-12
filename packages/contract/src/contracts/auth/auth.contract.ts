import { checkUsername, loginAuth, logoutAuth, refreshToken, registerAuth } from './auth.endpoint';

import { c } from '@/internal/c';

export const authContract = c.router({
  checkUsername: checkUsername,
  register: registerAuth,
  login: loginAuth,
  logout: logoutAuth,
  refreshToken: refreshToken,
});
