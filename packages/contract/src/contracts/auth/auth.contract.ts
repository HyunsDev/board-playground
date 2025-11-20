import { c } from 'common';
import { loginAuth, logoutAuth, refreshTokenAuth, registerAuth } from './auth.endpoints';

export const authContract = c.router({
  register: registerAuth,
  login: loginAuth,
  logout: logoutAuth,
  refreshToken: refreshTokenAuth,
});
