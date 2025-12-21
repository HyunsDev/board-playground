export interface HealthModuleOptions {
  /** /health 엔드포인트(Controller)를 활성화할지 여부 (기본값: false) */
  exposeHttp?: boolean;

  check?: {
    prisma?: boolean;
    redis?: boolean;
  };
}

export const HEALTH_OPTIONS = 'HEALTH_OPTIONS';
