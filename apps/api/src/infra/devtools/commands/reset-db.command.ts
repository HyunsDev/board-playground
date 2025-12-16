import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  DeriveMetadata,
  PrismaService,
  systemLog,
  SystemLogActionEnum,
} from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps } from '@workspace/backend-core';
import { AggregateCodeEnum, defineCommandCode, DomainCodeEnums } from '@workspace/domain';

type ResetDbCommandProps = BaseCommandProps<void>;

export class ResetDBCommand extends BaseCommand<
  ResetDbCommandProps,
  void,
  HandlerResult<ResetDBCommandHandler>
> {
  static readonly code = defineCommandCode('system:devtools:cmd:reset_db');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: ResetDbCommandProps['data'], metadata: DeriveMetadata) {
    super(null, data, metadata);
  }
}

@CommandHandler(ResetDBCommand)
export class ResetDBCommandHandler implements ICommandHandler<ResetDBCommand> {
  private readonly logger = new Logger(ResetDBCommandHandler.name);

  constructor(private readonly prisma: PrismaService) {}

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
    this.logger.log(
      systemLog(DomainCodeEnums.System.Devtools, SystemLogActionEnum.DevtoolsUsage, {
        msg: `Database reset executed. Truncated tables: ${targets}`,
      }),
    );
    return ok(undefined);
  }
}
