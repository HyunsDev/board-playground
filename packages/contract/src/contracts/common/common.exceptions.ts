import { ExceptionRecord } from '@/common';

export const COMMON_EXCEPTION = {
  BAD_REQUEST: {
    status: 400,
    code: 'BAD_REQUEST',
    message: '잘못된 요청입니다',
  },
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
    message: '요청한 자원을 찾을 수 없습니다',
  },
  CONFLICT: {
    status: 409,
    code: 'CONFLICT',
    message: '요청이 현재 리소스의 상태와 충돌합니다',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다',
  },
  ACCESS_DENIED: {
    status: 403,
    code: 'ACCESS_DENIED',
    message: '접근이 금지되었습니다',
  },
  ARGUMENT_INVALID: {
    status: 500,
    code: 'ARGUMENT_INVALID',
    message: '인자가 유효하지 않습니다',
  },
  ARGUMENT_NOT_PROVIDED: {
    status: 500,
    code: 'ARGUMENT_NOT_PROVIDED',
    message: '필수 인자가 제공되지 않았습니다',
  },
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: '유효성 검사에 실패했습니다',
  },
  UNAUTHORIZED: {
    status: 401,
    code: 'UNAUTHORIZED',
    message: '인증이 필요합니다',
  },
  UNEXPECTED_DOMAIN_ERROR: {
    status: 500,
    code: 'UNEXPECTED_DOMAIN_ERROR',
    message: '예기치 못한 도메인 오류가 발생했습니다',
  },
  UNHANDLED_DOMAIN_ERROR: {
    status: 500,
    code: 'UNHANDLED_DOMAIN_ERROR',
    message: '처리되지 않은 도메인 오류가 발생했습니다',
  },
} as const satisfies ExceptionRecord;
