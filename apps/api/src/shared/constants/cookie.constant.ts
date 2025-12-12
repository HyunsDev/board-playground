import { CookieOptions } from 'express';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // 환경변수 직접 접근 혹은 주입 필요
  path: '/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: 'strict',
};
