import { applyDecorators, UseGuards } from '@nestjs/common';

import { UserRole } from '@workspace/contract';

import { Roles } from './roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

/**
 * 인증 및 인가를 처리하는 통합 데코레이터
 * @param roles 허용할 유저 권한 (없으면 인증된 모든 유저 접근 가능)
 */
export function Auth(...roles: UserRole[]) {
  // role이 있으면 Roles 데코레이터 적용, 없으면 Guard만 적용
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
