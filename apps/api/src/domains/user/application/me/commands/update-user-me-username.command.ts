import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { BaseICommand, BaseCommand } from '@/shared/base';

type IUpdateUserMeUsernameCommand = BaseICommand<{
  userId: string;
  newUsername: string;
}>;

export class UpdateUserMeUsernameCommand extends BaseCommand<
  IUpdateUserMeUsernameCommand,
  HandlerResult<UpdateUserMeUsernameCommandHandler>,
  UserEntity
> {
  readonly code = defineCommandCode('account:user:cmd:update_me_username');
  readonly resourceType = AggregateCodeEnum.Account.User;

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
  constructor(private readonly userRepo: UserRepositoryPort) {}

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
