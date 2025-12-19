import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { BaseCommandProps, BaseCommand, DrivenMessageMetadata } from '@workspace/backend-core';
import { matchError, UnexpectedDomainErrorException } from '@workspace/backend-ddd';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';

type IUpdateUserMeUsernameCommand = BaseCommandProps<{
  userId: string;
  newUsername: string;
}>;

export class UpdateUserMeUsernameCommand extends BaseCommand<
  IUpdateUserMeUsernameCommand,
  UserEntity,
  HandlerResult<UpdateUserMeUsernameCommandHandler>
> {
  static readonly code = asCommandCode('account:user:cmd:update_me_username');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUpdateUserMeUsernameCommand['data'], metadata: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}

@CommandHandler(UpdateUserMeUsernameCommand)
export class UpdateUserMeUsernameCommandHandler implements ICommandHandler<UpdateUserMeUsernameCommand> {
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
