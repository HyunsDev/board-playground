import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserEntity } from '../../domain/user.entity';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { BaseCommand, ICommand, UnexpectedDomainErrorException } from '@/shared/base';
import { CommandCodes } from '@/shared/codes/command.codes';
import { DomainCodes } from '@/shared/codes/domain.codes';
import { HandlerResult } from '@/shared/types/handler-result';
import { matchError } from '@/shared/utils/match-error.utils';

type IUpdateUserMeUsernameCommand = ICommand<{
  userId: string;
  newUsername: string;
}>;

export class UpdateUserMeUsernameCommand extends BaseCommand<
  IUpdateUserMeUsernameCommand,
  HandlerResult<UpdateUserMeUsernameCommandHandler>,
  UserEntity
> {
  readonly domain = DomainCodes.User;
  readonly code = CommandCodes.User.UpdateMeUsername;
  readonly resourceType = DomainCodes.User;

  constructor(
    data: IUpdateUserMeUsernameCommand['data'],
    metadata: IUpdateUserMeUsernameCommand['metadata'],
  ) {
    super(data.userId, data, metadata);
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

  async execute({ data }: IUpdateUserMeUsernameCommand) {
    const userResult = await this.userRepo.getOneById(data.userId);
    if (userResult.isErr()) return userResult;
    const user = userResult.value;

    user.updateUsername(data.newUsername);

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
