import { defineErrorRecord } from '@/internal/utils/define-api-errors.utils';

export const BoardApiErrors = defineErrorRecord({
  NotFound: {
    status: 404,
    code: 'BOARD_NOT_FOUND',
    message: '요청한 보드를 찾을 수 없습니다',
  },
  SlugAlreadyExists: {
    status: 400,
    code: 'SLUG_ALREADY_EXISTS',
    message: '이미 존재하는 보드 슬러그입니다',
  },
  PermissionDenied: {
    status: 403,
    code: 'BOARD_PERMISSION_DENIED',
    message: '보드에 대한 권한이 없습니다',
  },
});
