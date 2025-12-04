import { ok } from 'assert';

import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err } from 'neverthrow';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { CommandBase, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

export class DeleteUserMeCommand extends CommandBase {
  public readonly userId: string;

  constructor(props: CommandProps<DeleteUserMeCommand>) {
    super(props);
    this.userId = props.userId;
  }
}

@CommandHandler(DeleteUserMeCommand)
export class DeleteUserMeCommandHandler implements ICommandHandler<DeleteUserMeCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: DeleteUserMeCommand) {
    const userResult = await this.userRepo.getOneById(command.userId);
    if (userResult.isErr()) return userResult;
    const user = userResult.value;

    return (await this.userRepo.delete(user)).match(
      () => ok(undefined),
      (e) => err(e),
    );
  }
}

export type DeleteUserMeCommandResult = HandlerResult<DeleteUserMeCommandHandler>;
