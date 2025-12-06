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
  REVOKED: {
    status: 403,
    code: 'SESSION_REVOKED',
    message: '세션이 해지되었습니다',
  },
  CLOSED: {
    status: 403,
    code: 'SESSION_CLOSED',
    message: '세션이 종료되었습니다',
  },
} as const satisfies ExceptionRecord;
