import { loginAuth, logoutAuth, refreshTokenAuth, registerAuth } from './auth.endpoints';

import { c } from '@/common';

export const authContract = c.router({
  register: registerAuth,
  login: loginAuth,
  logout: logoutAuth,
  refreshToken: refreshTokenAuth,
});
