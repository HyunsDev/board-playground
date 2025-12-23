import { checkUsernameAvailability, logoutAuth, refreshAccessToken } from './auth-common.endpoint';
import {
  oAuthAuthStart,
  oAuthGoogleCallback,
  stepUpWithOAuthGoogleCallback,
  stepUpWithOAuthStart,
} from './auth-oauth.endpoints';
import {
  changePassword,
  loginWithPassword,
  registerWithPassword,
  sendVerificationEmail,
  sendResetEmail,
  resetPassword,
  stepUpWithPassword,
} from './auth-password.endpoints';

import { c } from '@/internal/c';

export const authContract = c.router({
  checkUsernameAvailability: checkUsernameAvailability,
  logout: logoutAuth,
  refresh: refreshAccessToken,

  password: {
    sendVerificationEmail: sendVerificationEmail,
    register: registerWithPassword,
    login: loginWithPassword,
    change: changePassword,
    sendResetEmail: sendResetEmail,
    reset: resetPassword,
    stepUp: stepUpWithPassword,
  },

  oAuth: {
    start: oAuthAuthStart,
    googleCallback: oAuthGoogleCallback,
    startStepUp: stepUpWithOAuthStart,
    stepUpGoogleCallback: stepUpWithOAuthGoogleCallback,
  },
});
