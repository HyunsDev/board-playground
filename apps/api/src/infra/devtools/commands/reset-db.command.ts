import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';

import { DatabaseService } from '@/infra/database/database.service';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type ResetDbCommandProps = CommandProps<void>;

export class ResetDbCommand extends BaseCommand<
  ResetDbCommandProps,
  HandlerResult<ResetDbCommandHandler>,
  void
> {}

@CommandHandler(ResetDbCommand)
export class ResetDbCommandHandler implements ICommandHandler<ResetDbCommand> {
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
    this.logger.debug(`Truncated tables: ${targets}`, ResetDbCommandHandler.name);
    return ok(undefined);
  }
}
