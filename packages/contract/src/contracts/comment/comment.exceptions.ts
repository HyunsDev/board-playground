import { ExceptionRecord } from '@/common';

export const CommentApiErrors = {
  NotFound: {
    status: 404,
    code: 'COMMENT_NOT_FOUND',
    message: '요청한 댓글을 찾을 수 없습니다',
  },
  PermissionDenied: {
    status: 403,
    code: 'COMMENT_PERMISSION_DENIED',
    message: '댓글에 대한 권한이 없습니다',
  },
  DepthExceeded: {
    status: 400,
    code: 'COMMENT_DEPTH_EXCEEDED',
    message: '댓글의 최대 깊이를 초과했습니다',
  },
} as const satisfies ExceptionRecord;
