import { ExceptionRecord } from '@/common/interfaces/exception.interface';

export const AUTH_EXCEPTION = {
  UNAUTHORIZED: {
    status: 401,
    code: 'UNAUTHORIZED',
    message: '인증에 실패하였습니다.',
  },
  MISSING_TOKEN: {
    status: 401,
    code: 'MISSING_TOKEN',
    message: '토큰이 제공되지 않았습니다.',
  },
  INVALID_TOKEN: {
    status: 401,
    code: 'INVALID_TOKEN',
    message: '유효하지 않은 토큰입니다.',
  },
  EXPIRED_TOKEN: {
    status: 401,
    code: 'EXPIRED_TOKEN',
    message: '만료된 토큰입니다.',
  },
  INVALID_CREDENTIALS: {
    status: 400,
    code: 'INVALID_CREDENTIALS',
    message: '잘못된 인증 정보입니다.',
  },
} as const satisfies ExceptionRecord;
