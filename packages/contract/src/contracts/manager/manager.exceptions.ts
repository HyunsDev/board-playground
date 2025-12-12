import type { ApiErrorRecord } from '@/internal/types/api-error-record.type';

export const ManagerApiErrors = {
  NotFound: {
    status: 404,
    code: 'MANAGER_NOT_FOUND',
    message: '요청한 매니저를 찾을 수 없습니다',
  },
  Forbidden: {
    status: 403,
    code: 'MANAGER_FORBIDDEN',
    message: '매니저에 대한 권한이 없습니다',
  },
} as const satisfies ApiErrorRecord;
