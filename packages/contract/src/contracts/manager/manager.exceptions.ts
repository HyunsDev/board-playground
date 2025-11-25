import { ExceptionRecord } from '@/common/interfaces/exception.interface';

export const MANAGER_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'MANAGER_NOT_FOUND',
    message: '요청한 매니저를 찾을 수 없습니다.',
  },
  FORBIDDEN: {
    status: 403,
    code: 'MANAGER_FORBIDDEN',
    message: '매니저에 대한 권한이 없습니다.',
  },
} as const satisfies ExceptionRecord;
