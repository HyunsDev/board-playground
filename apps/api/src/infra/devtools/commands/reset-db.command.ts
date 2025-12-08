import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { DatabaseService } from '@/infra/database/database.service';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { ResourceTypes } from '@/shared/codes/resource-type.codes';
import { HandlerResult } from '@/shared/types/handler-result';

type ResetDbCommandProps = ICommand<void>;

export class ResetDBCommand extends BaseCommand<
  ResetDbCommandProps,
  HandlerResult<ResetDBCommandHandler>,
  void
> {
  readonly domain = DomainCodes.Devtools;
  readonly code = CommandCodes.Devtools.ResetDB;
  readonly resourceType = ResourceTypes.User;

  constructor(data: ResetDbCommandProps['data'], metadata: ResetDbCommandProps['metadata']) {
    super(null, data, metadata);
  }
}

@CommandHandler(ResetDBCommand)
export class ResetDBCommandHandler implements ICommandHandler<ResetDBCommand> {
  constructor(
    private readonly prisma: DatabaseService,
    private readonly logger: Logger,
  ) {}

  async execute() {
    const tables = await this.prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;

    const tablesToTruncate = tables
      .map((t) => t.tablename)
      .filter((name) => name !== '_prisma_migrations');
    if (tablesToTruncate.length === 0) return;
    const targets = tablesToTruncate.map((name) => `"${name}"`).join(', ');
    const query = `TRUNCATE TABLE ${targets} RESTART IDENTITY CASCADE;`;
    void (await this.prisma.$executeRawUnsafe(query));
    this.logger.debug(`Truncated tables: ${targets}`, ResetDBCommandHandler.name);
    return ok(undefined);
  }
}
