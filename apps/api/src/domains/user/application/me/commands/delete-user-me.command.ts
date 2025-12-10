import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constants';
import { BaseCommand, ICommand } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { matchError } from '@/shared/utils/match-error.utils';

type IDeleteUserMeCommand = ICommand<{
  userId: string;
}>;

export class DeleteUserMeCommand extends BaseCommand<
  IDeleteUserMeCommand,
  HandlerResult<DeleteUserMeCommandHandler>,
  void
> {
  readonly code = CommandCodes.User.DeleteMe;
  readonly resourceType = DomainCodes.User;

  constructor(data: IDeleteUserMeCommand['data'], metadata: IDeleteUserMeCommand['metadata']) {
    super(data.userId, data, metadata);
  }
}

@CommandHandler(DeleteUserMeCommand)
export class DeleteUserMeCommandHandler implements ICommandHandler<DeleteUserMeCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: IDeleteUserMeCommand) {
    const userResult = await this.userRepo.getOneById(data.userId);
    if (userResult.isErr()) {
      return matchError(userResult.error, {
        UserNotFound: (e) => err(e),
      });
    }
    const user = userResult.value;

    return (await this.userRepo.delete(user)).match(
      () => ok(undefined),
      (e) => err(e),
    );
  }
}
