import { UserRole } from '@workspace/contract';

export type TokenPayload = {
  sub: string;
  role: UserRole;
  email: string;
  deviceId: string;
};
