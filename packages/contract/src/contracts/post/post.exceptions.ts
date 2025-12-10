import type { ApiErrorRecord } from '@/internal/types/api-error-record.type';

export const PostApiErrors = {
  NotFound: {
    status: 404,
    code: 'POST_NOT_FOUND',
    message: '요청한 게시글을 찾을 수 없습니다',
  },
  PermissionDenied: {
    status: 403,
    code: 'POST_PERMISSION_DENIED',
    message: '게시글에 대한 권한이 없습니다',
  },
} as const satisfies ApiErrorRecord;
