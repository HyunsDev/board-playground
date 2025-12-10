import type { ApiErrorRecord } from '@/internal/types/api-error-record.type';

export const CommonApiErrors = {
  accessDenied: {
    status: 403,
    code: 'ACCESS_DENIED',
    message: '접근이 금지되었습니다',
  },
  InternalServerError: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다',
  },
  AccessDenied: {
    status: 403,
    code: 'ACCESS_DENIED',
    message: '접근이 금지되었습니다',
  },
  ValidationError: {
    status: 400,
    code: 'VALIDATION_ERROR',
    message: '유효성 검사에 실패했습니다',
  },
  UnexpectedDomainError: {
    status: 500,
    code: 'UNEXPECTED_DOMAIN_ERROR',
    message: '예기치 못한 도메인 오류가 발생했습니다',
  },
  UnhandledDomainError: {
    status: 500,
    code: 'UNHANDLED_DOMAIN_ERROR',
    message: '처리되지 않은 도메인 오류가 발생했습니다',
  },
} as const satisfies ApiErrorRecord;
