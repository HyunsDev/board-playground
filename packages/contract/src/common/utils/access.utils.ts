import { USER_ROLE, UserRole } from '@/contracts';

export interface AccessMetadata {
  isPublic: boolean;
  roles?: UserRole[];
}

export const accessRole = {
  public: () => ({ isPublic: true }),
  signedIn: () => ({ isPublic: false }),
  admin: () => ({ isPublic: false, roles: [USER_ROLE.ADMIN] }),
  roles: (roles: UserRole[]) => ({ isPublic: false, roles }),
};
