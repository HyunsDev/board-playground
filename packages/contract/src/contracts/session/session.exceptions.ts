import { ExceptionRecord } from '@/common';

export const SESSION_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'SESSION_NOT_FOUND',
    message: '세션을 찾을 수 없습니다',
  },
} as const satisfies ExceptionRecord;
