import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { PrismaService } from '@workspace/backend-core';
import { BaseCommand, BaseICommand } from '@workspace/backend-core';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

type ResetDbCommandProps = BaseICommand<void>;

export class ResetDBCommand extends BaseCommand<
  ResetDbCommandProps,
  HandlerResult<ResetDBCommandHandler>,
  void
> {
  readonly code = defineCommandCode('system:devtools:cmd:reset_db');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ResetDbCommandProps['data'], metadata: ResetDbCommandProps['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(ResetDBCommand)
export class ResetDBCommandHandler implements ICommandHandler<ResetDBCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async execute() {
    const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tablesToTruncate = tables
      .map((t) => t.tablename)
      .filter((name) => name !== '_prisma_migrations');
    if (tablesToTruncate.length === 0) return ok(undefined);
    const targets = tablesToTruncate.map((name) => `"${name}"`).join(', ');
    const query = `TRUNCATE TABLE ${targets} RESTART IDENTITY CASCADE;`;
    void (await this.prisma.$executeRawUnsafe(query));
    this.logger.debug(`Truncated tables: ${targets}`, ResetDBCommandHandler.name);
    return ok(undefined);
  }
}
