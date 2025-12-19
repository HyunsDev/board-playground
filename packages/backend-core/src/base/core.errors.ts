import { BaseInternalServerException } from '@workspace/backend-ddd';
import { Prisma } from '@workspace/database';

export class UnexpectedPrismaErrorException extends BaseInternalServerException<
  'UnexpectedPrismaError',
  {
    prismaCode?: string;
    prismaMeta?: unknown;
    originalError: unknown;
  }
> {
  readonly code = 'UnexpectedPrismaError' as const;
  readonly scope = 'private' as const;

  constructor(error: unknown) {
    const errorMessage =
      error instanceof Error
        ? `데이터베이스 오류: ${error.message}`
        : `데이터베이스 알 수 없는 오류: ${String(error)}`;

    // 2. Prisma 상세 정보 추출 (이 클래스의 존재 의의)
    let prismaCode: string | undefined;
    let prismaMeta: unknown | undefined;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      prismaCode = error.code;
      prismaMeta = error.meta;
    }

    super(
      errorMessage,
      {
        prismaCode,
        prismaMeta,
        originalError: error,
      },
      error,
    );
  }
}
