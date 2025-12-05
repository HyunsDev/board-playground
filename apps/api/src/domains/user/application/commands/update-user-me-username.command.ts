import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { CommandBase, CommandProps, UnexpectedDomainErrorException } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

export class UpdateUserMeUsernameCommand extends CommandBase {
  public readonly userId: string;
  public readonly newUsername: string;

  constructor(props: CommandProps<UpdateUserMeUsernameCommand>) {
    super(props);
    this.userId = props.userId!;
    this.newUsername = props.newUsername!;
  }
}

@CommandHandler(UpdateUserMeUsernameCommand)
export class UpdateUserMeUsernameCommandHandler
  implements ICommandHandler<UpdateUserMeUsernameCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserMeUsernameCommand) {
    const userResult = await this.userRepo.getOneById(command.userId);
    if (userResult.isErr()) return userResult;
    const user = userResult.value;

    user.updateUsername(command.newUsername);

    return (await this.userRepo.update(user)).match(
      (updatedUser) => ok(updatedUser),
      (error) =>
        matchError(error, {
          UserNotFound: (e) => err(e),
          UserEmailAlreadyExists: (e) => {
            throw new UnexpectedDomainErrorException(e);
          },
          UserUsernameAlreadyExists: (e) => err(e),
        }),
    );
  }
}

export type UpdateUserMeUsernameCommandResult = HandlerResult<UpdateUserMeUsernameCommandHandler>;
