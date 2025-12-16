import { CookieSerializeOptions } from '@fastify/cookie';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieSerializeOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  path: '/auth',
  maxAge: 30 * 24 * 60 * 60,
  sameSite: 'strict',
};
