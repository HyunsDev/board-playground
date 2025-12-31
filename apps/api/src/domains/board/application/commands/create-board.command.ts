import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import {
  BaseCommand,
  BaseCommandProps,
  CommandHandler,
  ICommandHandler,
  TransactionManager,
} from '@workspace/backend-core';
import { matchError } from '@workspace/backend-ddd';
import { UserId } from '@workspace/domain';
import { AggregateCodeEnum, asCommandCode, BoardSlug } from '@workspace/domain';

import { BoardEntity, BoardRepositoryPort } from '../../domain';

type CreateBoardCommandProps = BaseCommandProps<{
  slug: BoardSlug;
  name: string;
  description?: string | null;
  creatorId: UserId;
}>;

export class CreateBoardCommand extends BaseCommand<
  CreateBoardCommandProps,
  BoardEntity,
  HandlerResult<CreateBoardCommandHandler>
> {
  static readonly code = asCommandCode('community:board:cmd:create');
  readonly resourceType = AggregateCodeEnum.Community.Board;

  constructor(data: CreateBoardCommandProps['data']) {
    super(null, data);
  }
}

@CommandHandler(CreateBoardCommand)
export class CreateBoardCommandHandler implements ICommandHandler<CreateBoardCommand> {
  constructor(
    private readonly txManager: TransactionManager,
    private readonly repo: BoardRepositoryPort,
  ) {}

  async execute({ data }: CreateBoardCommandProps) {
    return await this.txManager.run(async () => {
      const board = BoardEntity.create({
        slug: data.slug,
        name: data.name,
        description: data.description ?? null,
        creatorId: data.creatorId,
      });

      return (await this.repo.create(board)).match(
        (createdBoard) => ok(createdBoard),
        (error) =>
          matchError(error, {
            BoardSlugAlreadyExists: (e) => err(e),
          }),
      );
    });
  }
}
