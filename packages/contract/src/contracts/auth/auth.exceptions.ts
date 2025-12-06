import { ExceptionRecord } from '@/common';

export const AUTH_EXCEPTION = {
  INVALID_CREDENTIALS: {
    status: 400,
    code: 'INVALID_CREDENTIALS',
    message: '잘못된 인증 정보입니다',
  },
  ACCESS_TOKEN_MISSING: {
    status: 401,
    code: 'ACCESS_TOKEN_MISSING',
    message: '토큰이 제공되지 않았습니다',
  },
  ACCESS_TOKEN_INVALID: {
    status: 401,
    code: 'ACCESS_TOKEN_INVALID',
    message: '유효하지 않은 토큰입니다',
  },
  ACCESS_TOKEN_EXPIRED: {
    status: 401,
    code: 'ACCESS_TOKEN_EXPIRED',
    message: '만료된 토큰입니다',
  },
  REFRESH_TOKEN_MISSING: {
    status: 401,
    code: 'REFRESH_TOKEN_MISSING',
    message: '리프레시 토큰이 제공되지 않았습니다',
  },
  REFRESH_TOKEN_INVALID: {
    status: 401,
    code: 'REFRESH_TOKEN_INVALID',
    message: '유효하지 않은 리프레시 토큰입니다',
  },
  REFRESH_TOKEN_REUSE_DETECTED: {
    status: 401,
    code: 'REFRESH_TOKEN_REUSE_DETECTED',
    message: '이미 사용된 리프레시 토큰입니다',
  },
  SESSION_REVOKED: {
    status: 403,
    code: 'SESSION_REVOKED',
    message: '세션이 해지되었습니다',
  },
  SESSION_CLOSED: {
    status: 403,
    code: 'SESSION_CLOSED',
    message: '세션이 종료되었습니다',
  },
  SESSION_EXPIRED: {
    status: 403,
    code: 'SESSION_EXPIRED',
    message: '세션이 만료되었습니다',
  },
} as const satisfies ExceptionRecord;
