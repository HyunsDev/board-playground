import z from 'zod';

export const BOARD_EXCEPTION_CODE = {
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
  SLUG_ALREADY_EXISTS: 'SLUG_ALREADY_EXISTS',
  BOARD_PERMISSION_DENIED: 'BOARD_PERMISSION_DENIED',
} as const;
export const BoardExceptionCode = z.enum(BOARD_EXCEPTION_CODE);
export type BoardExceptionCode = z.infer<typeof BoardExceptionCode>;

export const BOARD_EXCEPTION = {
  BOARD_NOT_FOUND: {
    code: BOARD_EXCEPTION_CODE.BOARD_NOT_FOUND,
    status: 404,
  },
  SLUG_ALREADY_EXISTS: {
    code: BOARD_EXCEPTION_CODE.SLUG_ALREADY_EXISTS,
    status: 400,
  },
  BOARD_PERMISSION_DENIED: {
    code: BOARD_EXCEPTION_CODE.BOARD_PERMISSION_DENIED,
    status: 403,
  },
} as const;
