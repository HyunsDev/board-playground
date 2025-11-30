import { ExceptionRecord } from '@/common';

export const USER_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'USER_NOT_FOUND',
    message: '요청한 사용자를 찾을 수 없습니다',
  },
  INVALID_PROFILE_IMAGE: {
    status: 400,
    code: 'INVALID_PROFILE_IMAGE',
    message: '유효하지 않은 프로필 이미지입니다',
  },
  EMAIL_ALREADY_EXISTS: {
    status: 409,
    code: 'EMAIL_ALREADY_EXISTS',
    message: '이미 존재하는 이메일입니다',
  },
  USERNAME_ALREADY_EXISTS: {
    status: 409,
    code: 'USERNAME_ALREADY_EXISTS',
    message: '이미 존재하는 사용자 이름입니다',
  },
  ADMIN_CANNOT_BE_DELETED: {
    status: 400,
    code: 'ADMIN_CANNOT_BE_DELETED',
    message: '관리자 계정은 삭제할 수 없습니다',
  },
} as const satisfies ExceptionRecord;
