import { SetMetadata } from '@nestjs/common';

import { UserRole } from '@workspace/contract'; // Contract에 정의된 Enum

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
