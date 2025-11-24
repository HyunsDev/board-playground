export type TokenPayload = {
  sub: string;
  tokenType: 'access' | 'refresh';
  email: string;
  deviceIdentifier: string;
};
