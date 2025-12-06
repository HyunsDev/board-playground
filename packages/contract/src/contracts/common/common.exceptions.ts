import { ExceptionRecord } from '@/common';

export const COMMON_EXCEPTION = {
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
  VALIDATION_ERROR: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: '유효성 검사에 실패했습니다',
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
