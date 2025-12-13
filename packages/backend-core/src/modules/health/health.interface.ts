export interface HealthModuleOptions {
  /** /health 엔드포인트(Controller)를 활성화할지 여부 (기본값: false) */
  exposeHttp?: boolean;

  /** Prisma DB 연결 상태를 체크할지 여부 (기본값: false) */
  checkDatabase?: boolean;
}

export const HEALTH_OPTIONS = 'HEALTH_OPTIONS';
