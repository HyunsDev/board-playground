import { err } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { ManagerEntity, ManagerRepositoryPort } from '../../domain';

import { UserFacade } from '@/domains/user';

type AppointSubManagerCommandProps = BaseCommandProps<{
  boardId: string;
  userEmail: string;
  actorId: string;
}>;

export class AppointSubManagerCommand extends BaseCommand<
  AppointSubManagerCommandProps,
  ManagerEntity,
  HandlerResult<AppointSubManagerCommandHandler>
> {
  static readonly code = asCommandCode('community:manager:cmd:appoint_sub_manager');
  readonly resourceType = AggregateCodeEnum.Community.Manager;

  constructor(data: AppointSubManagerCommandProps['data']) {
    super(null, data);
  }
}

@CommandHandler(AppointSubManagerCommand)
export class AppointSubManagerCommandHandler implements ICommandHandler<AppointSubManagerCommand> {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly user: UserFacade,
    private readonly repo: ManagerRepositoryPort,
  ) {}

  async execute({ data }: AppointSubManagerCommandProps) {
    return await this.txManager.run(async () => {
      const actorResult = await this.repo.getOneByBoardIdAndUserId(data.boardId, data.actorId);
      if (actorResult.isErr()) return err(actorResult.error);
      const actor = actorResult.value;

      const targetUserResult = await this.user.getOneByEmail(data.userEmail);
      if (targetUserResult.isErr()) return err(targetUserResult.error);
      const targetUser = targetUserResult.value;

      const managerResult = ManagerEntity.createSubManager(
        {
          boardId: data.boardId,
          userId: targetUser.id,
          appointedById: data.actorId,
        },
        actor,
      );
      if (managerResult.isErr()) return err(managerResult.error);
      const manager = managerResult.value;

      const createResult = await this.repo.create(manager);
      if (createResult.isErr()) return err(createResult.error);

      return createResult;
    });
  }
}
