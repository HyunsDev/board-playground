import { ExceptionRecord } from '@/common/interfaces/exception.interface';

export const DEVICE_EXCEPTION = {
  NOT_FOUND: {
    status: 404,
    code: 'DEVICE_NOT_FOUND',
    message: '요청한 디바이스를 찾을 수 없습니다.',
  },
} as const satisfies ExceptionRecord;
