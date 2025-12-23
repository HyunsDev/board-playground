export const getEmailVerificationCodeKey = (email: string) =>
  `auth:email-verification-code:${email}`;
