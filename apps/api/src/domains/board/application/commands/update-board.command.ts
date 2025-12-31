import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { matchError } from '@workspace/backend-ddd';
import { UserId } from '@workspace/domain';
import { AggregateCodeEnum, asCommandCode, BoardSlug } from '@workspace/domain';

import { BoardEntity, BoardRepositoryPort } from '../../domain';

import { ManagerFacade } from '@/domains/manager/application/manager.facade';
import { UserNotManagerError } from '@/domains/manager/domain';

type UpdateBoardCommandProps = BaseCommandProps<{
  boardSlug: BoardSlug;
  name?: string;
  description?: string | null;
  actorId: UserId;
}>;

export class UpdateBoardCommand extends BaseCommand<
  UpdateBoardCommandProps,
  BoardEntity,
  HandlerResult<UpdateBoardCommandHandler>
> {
  static readonly code = asCommandCode('community:board:cmd:update');
  readonly resourceType = AggregateCodeEnum.Community.Board;

  constructor(data: UpdateBoardCommandProps['data']) {
    super(data.boardSlug, data);
  }
}

@CommandHandler(UpdateBoardCommand)
export class UpdateBoardCommandHandler {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly repo: BoardRepositoryPort,
    private readonly managerFacade: ManagerFacade,
  ) {}

  async execute({ data }: UpdateBoardCommandProps) {
    return await this.txManager.run(async () => {
      const boardResult = await this.repo.getOneBySlug(data.boardSlug);
      if (boardResult.isErr())
        return matchError(boardResult.error, {
          BoardNotFound: (e) => err(e),
        });
      const board = boardResult.value;

      const isUserManagerOfBoard = await this.managerFacade.isUserManagerOfBoard(
        board.id,
        data.actorId,
      );
      if (!isUserManagerOfBoard) {
        return err(new UserNotManagerError());
      }

      if (data.name) {
        board.updateName(data.name, data.actorId);
      }

      if (data.description !== undefined) {
        board.updateDescription(data.description);
      }

      return (await this.repo.update(board)).match(
        (updatedBoard) => ok(updatedBoard),
        (error) =>
          matchError(error, {
            BoardNotFound: (e) => err(e),
          }),
      );
    });
  }
}
