export const getEmailVerificationCodeKey = (email: string) =>
  `auth:email-verification-code:${email}`;

export const getPasswordResetCodeKey = (email: string) =>
  `auth:password-reset-code:${email}`;
