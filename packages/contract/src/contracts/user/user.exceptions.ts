import z from 'zod';

export const USER_EXCEPTION_CODE = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PROFILE_IMAGE: 'INVALID_PROFILE_IMAGE',
} as const;
export const UserExceptionCode = z.enum(USER_EXCEPTION_CODE);
export type UserExceptionCode = z.infer<typeof UserExceptionCode>;

export const USER_EXCEPTION = {
  USER_NOT_FOUND: {
    code: USER_EXCEPTION_CODE.USER_NOT_FOUND,
    status: 404,
  },
  INVALID_PROFILE_IMAGE: {
    code: USER_EXCEPTION_CODE.INVALID_PROFILE_IMAGE,
    status: 400,
  },
} as const;
