import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../../domain';

type TransferMainManagerCommandProps = BaseCommandProps<{
  fromManagerId: string;
  toManagerId: string;
}>;

export class TransferMainManagerCommand extends BaseCommand<
  TransferMainManagerCommandProps,
  void,
  HandlerResult<TransferMainManagerCommandHandler>
> {
  static readonly code = asCommandCode('community:manager:cmd:transfer_main_manager');
  readonly resourceType = AggregateCodeEnum.Community.Manager;

  constructor(data: TransferMainManagerCommandProps['data']) {
    super(data.fromManagerId, data);
  }
}

@CommandHandler(TransferMainManagerCommand)
export class TransferMainManagerCommandHandler {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly repo: ManagerRepositoryPort,
  ) {}

  async execute({ data }: TransferMainManagerCommandProps) {
    return await this.txManager.run(async () => {
      const fromManagerResult = await this.repo.getOneById(data.fromManagerId);
      if (fromManagerResult.isErr()) return err(fromManagerResult.error);
      const fromManager = fromManagerResult.value;

      const toManagerResult = await this.repo.getOneById(data.toManagerId);
      if (toManagerResult.isErr()) return err(toManagerResult.error);
      const toManager = toManagerResult.value;

      const transferResult = ManagerEntity.transferMainManager(fromManager, toManager);
      if (transferResult.isErr()) return err(transferResult.error);
      const { to: newMainManager, from: newSubManager } = transferResult.value;

      const updateFromResult = await this.repo.update(newSubManager);
      if (updateFromResult.isErr()) return err(updateFromResult.error);

      const updateToResult = await this.repo.update(newMainManager);
      if (updateToResult.isErr()) return err(updateToResult.error);

      return ok(undefined);
    });
  }
}
