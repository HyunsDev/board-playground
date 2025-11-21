import { ExceptionRecord } from 'common/interfaces/exception.interface';

export const COMMON_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'NOT_FOUND',
    message: '요청한 자원을 찾을 수 없습니다.',
  },
  CONFLICT: {
    status: 409,
    code: 'CONFLICT',
    message: '요청이 현재 리소스의 상태와 충돌합니다.',
  },
  INTERNAL_SERVER_ERROR: {
    status: 500,
    code: 'INTERNAL_SERVER_ERROR',
    message: '서버 내부 오류가 발생했습니다.',
  },
  FORBIDDEN: {
    status: 403,
    code: 'FORBIDDEN',
    message: '접근이 금지되었습니다.',
  },
  ARGUMENT_INVALID: {
    status: 400,
    code: 'ARGUMENT_INVALID',
    message: '인자가 유효하지 않습니다.',
  },
} as const satisfies ExceptionRecord;
