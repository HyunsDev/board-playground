import { ExceptionRecord } from '@/common';

export const SESSION_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'SESSION_NOT_FOUND',
    message: '세션을 찾을 수 없습니다',
  },
  CURRENT_SESSION_CANNOT_BE_DELETED: {
    status: 400,
    code: 'CURRENT_SESSION_CANNOT_BE_DELETED',
    message: '현재 세션은 삭제할 수 없습니다',
  },
} as const satisfies ExceptionRecord;
