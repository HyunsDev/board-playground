import z from 'zod';

export const DEVICE_EXCEPTION_CODE = {
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
} as const;
export const DeviceExceptionCode = z.enum(DEVICE_EXCEPTION_CODE);
export type DeviceExceptionCode = z.infer<typeof DeviceExceptionCode>;

export const DEVICE_EXCEPTION = {
  DEVICE_NOT_FOUND: {
    code: DEVICE_EXCEPTION_CODE.DEVICE_NOT_FOUND,
    status: 404,
  },
};
