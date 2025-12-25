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

import { BoardFacade } from '@/domains/board/application/board.facade';
import { UserFacade } from '@/domains/user';

type AppointSubManagerCommandProps = BaseCommandProps<{
  boardSlug: string;
  targetUserEmail: string;
  actorUserId: string;
}>;

export class AppointSubManagerCommand extends BaseCommand<
  AppointSubManagerCommandProps,
  ManagerEntity,
  HandlerResult<AppointSubManagerCommandHandler>
> {
  static readonly code = asCommandCode('community:manager:cmd:appoint_sub_manager');
  readonly resourceType = AggregateCodeEnum.Community.Board;

  constructor(data: AppointSubManagerCommandProps['data']) {
    super(data.boardSlug, data);
  }
}

@CommandHandler(AppointSubManagerCommand)
export class AppointSubManagerCommandHandler implements ICommandHandler<AppointSubManagerCommand> {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly user: UserFacade,
    private readonly repo: ManagerRepositoryPort,
    private readonly boardFacade: BoardFacade,
  ) {}

  async execute({ data }: AppointSubManagerCommandProps) {
    return await this.txManager.run(async () => {
      const actorResult = await this.repo.getOneByBoardSlugAndUserId(
        data.boardSlug,
        data.actorUserId,
      );
      if (actorResult.isErr()) return err(actorResult.error);
      const actor = actorResult.value;

      const targetUserResult = await this.user.getOneByEmail(data.targetUserEmail);
      if (targetUserResult.isErr()) return err(targetUserResult.error);
      const targetUser = targetUserResult.value;

      const boardResult = await this.boardFacade.getOneBySlug(data.boardSlug);
      if (boardResult.isErr()) return err(boardResult.error);
      const board = boardResult.value;

      const managerResult = ManagerEntity.createSubManager(
        {
          boardId: board.id,
          userId: targetUser.id,
          appointedById: actor.id,
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
