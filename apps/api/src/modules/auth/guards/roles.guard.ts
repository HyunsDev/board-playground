import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@workspace/contract';

import { ROLES_KEY } from '../decorators/roles.decorator';

import { TokenPayload } from '@/common/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Role 제한이 없으면 통과
    if (!requiredRoles) {
      return true;
    }

    // Request에서 User(TokenPayload) 추출
    const { user } = context.switchToHttp().getRequest();
    const payload = user as TokenPayload;

    if (!payload || !requiredRoles.includes(payload.role)) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return true;
  }
}
