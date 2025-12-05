import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type DeleteUserMeCommandProps = CommandProps<{
  userId: string;
}>;

export class DeleteUserMeCommand extends BaseCommand<
  DeleteUserMeCommandProps,
  HandlerResult<DeleteUserMeCommandHandler>,
  void
> {}

@CommandHandler(DeleteUserMeCommand)
export class DeleteUserMeCommandHandler implements ICommandHandler<DeleteUserMeCommand> {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: DeleteUserMeCommandProps) {
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
