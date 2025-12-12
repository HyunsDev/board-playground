import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { matchError } from '@workspace/backend-ddd';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { BaseCommand, BaseICommand } from '@/shared/base';

type IDeleteUserMeCommand = BaseICommand<{
  userId: string;
}>;

export class DeleteUserMeCommand extends BaseCommand<
  IDeleteUserMeCommand,
  HandlerResult<DeleteUserMeCommandHandler>,
  void
> {
  readonly code = defineCommandCode('account:user:cmd:delete_me');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IDeleteUserMeCommand['data'], metadata: IDeleteUserMeCommand['metadata']) {
    super(data.userId, data, metadata);
  }
}

@CommandHandler(DeleteUserMeCommand)
export class DeleteUserMeCommandHandler implements ICommandHandler<DeleteUserMeCommand> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

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
