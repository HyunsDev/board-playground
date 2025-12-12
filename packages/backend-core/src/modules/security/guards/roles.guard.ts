import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { AccessDeniedError, DomainException } from '@workspace/backend-ddd';
import { UserRole } from '@workspace/database';

import { ROLES_KEY } from '../decorators/roles.decorator';

import { ContextService } from '@/modules/context';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly appContext: ContextService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Role 제한이 없으면 통과
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const token = this.appContext.getToken();

    if (!token || !requiredRoles.includes(token.role)) {
      throw new DomainException(new AccessDeniedError());
    }

    return true;
  }
}
