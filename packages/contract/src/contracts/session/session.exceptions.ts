import type { ApiErrorRecord } from '@/internal/types/api-error-record.type';

export const SessionApiErrors = {
  NotFound: {
    status: 404,
    code: 'SESSION_NOT_FOUND',
    message: '세션을 찾을 수 없습니다',
  },
  CurrentSessionCannotBeDeleted: {
    status: 400,
    code: 'CURRENT_SESSION_CANNOT_BE_DELETED',
    message: '현재 세션은 삭제할 수 없습니다',
  },
} as const satisfies ApiErrorRecord;
