import z from 'zod';

export const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()\-=+[\]{};:'",.<>/?\\|`~]{8,64}$/,
    '비밀번호는 영문자와 숫자를 포함한 8자 이상이어야 합니다.',
  );
