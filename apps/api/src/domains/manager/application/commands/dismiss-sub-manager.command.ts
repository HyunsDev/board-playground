import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { ManagerRepositoryPort } from '../../domain';

type DismissSubManagerCommandProps = BaseCommandProps<{
  targetManagerUserId: string;
  actManagerUserId: string;
  boardSlug: string;
}>;

export class DismissSubManagerCommand extends BaseCommand<
  DismissSubManagerCommandProps,
  void,
  HandlerResult<DismissSubManagerCommandHandler>
> {
  static readonly code = asCommandCode('community:manager:cmd:dismiss_sub_manager');
  readonly resourceType = AggregateCodeEnum.Community.Board;

  constructor(data: DismissSubManagerCommandProps['data']) {
    super(data.boardSlug, data);
  }
}

@CommandHandler(DismissSubManagerCommand)
export class DismissSubManagerCommandHandler implements ICommandHandler<DismissSubManagerCommand> {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly repo: ManagerRepositoryPort,
  ) {}

  async execute({ data }: DismissSubManagerCommandProps) {
    return await this.txManager.run(async () => {
      const actManagerResult = await this.repo.getOneByBoardSlugAndUserId(
        data.boardSlug,
        data.actManagerUserId,
      );
      if (actManagerResult.isErr()) return err(actManagerResult.error);
      const actManager = actManagerResult.value;

      const targetManagerResult = await this.repo.getOneByBoardSlugAndUserId(
        data.boardSlug,
        data.targetManagerUserId,
      );
      if (targetManagerResult.isErr()) return err(targetManagerResult.error);
      const targetManager = targetManagerResult.value;

      const beforeDeleteResult = targetManager.validateDelete(actManager);
      if (beforeDeleteResult.isErr()) return err(beforeDeleteResult.error);

      const deleteResult = await this.repo.delete(targetManager);
      if (deleteResult.isErr()) return err(deleteResult.error);

      return ok(undefined);
    });
  }
}
