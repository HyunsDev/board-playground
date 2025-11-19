import z from 'zod';

export const POST_EXCEPTION_CODE = {
  POST_NOT_FOUND: 'POST_NOT_FOUND',
  POST_PERMISSION_DENIED: 'POST_PERMISSION_DENIED',
  BOARD_NOT_FOUND: 'BOARD_NOT_FOUND',
} as const;
export const PostExceptionCode = z.enum(POST_EXCEPTION_CODE);
export type PostExceptionCode = z.infer<typeof PostExceptionCode>;

export const POST_EXCEPTION = {
  POST_NOT_FOUND: {
    code: POST_EXCEPTION_CODE.POST_NOT_FOUND,
    status: 404,
  },
  BOARD_NOT_FOUND: {
    code: POST_EXCEPTION_CODE.BOARD_NOT_FOUND,
    status: 404,
  },
  POST_PERMISSION_DENIED: {
    code: POST_EXCEPTION_CODE.POST_PERMISSION_DENIED,
    status: 403,
  },
} as const;
