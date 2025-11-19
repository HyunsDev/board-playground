import z from 'zod';

export const MANAGER_EXCEPTION_CODE = {
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  MANAGER_NOT_FOUND: 'MANAGER_NOT_FOUND',
  FORBIDDEN: 'FORBIDDEN',
} as const;
export const ManagerExceptionCode = z.enum(MANAGER_EXCEPTION_CODE);

export const MANAGER_EXCEPTION = {
  BOARD_NOT_FOUND: {
    code: MANAGER_EXCEPTION_CODE.BOARD_NOT_FOUND,
    status: 404,
  },
  USER_NOT_FOUND: {
    code: MANAGER_EXCEPTION_CODE.USER_NOT_FOUND,
    status: 404,
  },
  MANAGER_NOT_FOUND: {
    code: MANAGER_EXCEPTION_CODE.MANAGER_NOT_FOUND,
    status: 404,
  },
  FORBIDDEN: {
    code: MANAGER_EXCEPTION_CODE.FORBIDDEN,
    status: 403,
  },
} as const;
export type ManagerExceptionCode = z.infer<typeof ManagerExceptionCode>;
