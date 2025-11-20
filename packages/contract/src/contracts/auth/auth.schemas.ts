import z from 'zod';

export const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    '비밀번호는 영문 대/소문자, 숫자, 특수문자를 모두 포함해야 합니다.',
  );
