import z from 'zod';

export const AUTH_EXCEPTION_CODE = {
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
} as const;
export const AuthException = z.enum(AUTH_EXCEPTION_CODE);
export type AuthException = z.infer<typeof AuthException>;

export const AUTH_EXCEPTION = {
  EMAIL_ALREADY_EXISTS: {
    code: AUTH_EXCEPTION_CODE.EMAIL_ALREADY_EXISTS,
    status: 400,
  },
  INVALID_CREDENTIALS: {
    code: AUTH_EXCEPTION_CODE.INVALID_CREDENTIALS,
    status: 400,
  },
};
