import { type ApiErrorRecord } from '@/internal/types/api-error-record.type';

export const AuthApiErrors = {
  InvalidCredentials: {
    status: 400,
    code: 'INVALID_CREDENTIALS',
    message: '잘못된 인증 정보입니다',
  },
  AccessTokenMissing: {
    status: 401,
    code: 'ACCESS_TOKEN_MISSING',
    message: '토큰이 제공되지 않았습니다',
  },
  AccessTokenInvalid: {
    status: 401,
    code: 'ACCESS_TOKEN_INVALID',
    message: '유효하지 않은 토큰입니다',
  },
  AccessTokenExpired: {
    status: 401,
    code: 'ACCESS_TOKEN_EXPIRED',
    message: '만료된 토큰입니다',
  },
  RefreshTokenMissing: {
    status: 401,
    code: 'REFRESH_TOKEN_MISSING',
    message: '리프레시 토큰이 제공되지 않았습니다',
  },
  RefreshTokenInvalid: {
    status: 401,
    code: 'REFRESH_TOKEN_INVALID',
    message: '유효하지 않은 리프레시 토큰입니다',
  },
  RefreshTokenReuseDetected: {
    status: 401,
    code: 'REFRESH_TOKEN_REUSE_DETECTED',
    message: '이미 사용된 리프레시 토큰입니다',
  },
  SessionRevoked: {
    status: 403,
    code: 'SESSION_REVOKED',
    message: '세션이 해지되었습니다',
  },
  SessionClosed: {
    status: 403,
    code: 'SESSION_CLOSED',
    message: '세션이 종료되었습니다',
  },
  SessionExpired: {
    status: 403,
    code: 'SESSION_EXPIRED',
    message: '세션이 만료되었습니다',
  },
} as const satisfies ApiErrorRecord;
