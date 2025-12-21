import { defineErrorRecord } from '@/internal/utils/define-api-errors.utils';

export const CommonApiErrors = defineErrorRecord({
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
  TooManyRequests: {
    status: 429,
    code: 'TOO_MANY_REQUESTS',
    message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
});
