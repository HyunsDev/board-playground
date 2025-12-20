import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps, DrivenMessageMetadata } from '@workspace/backend-core';
import { matchError } from '@workspace/backend-ddd';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';

type IDeleteUserMeCommand = BaseCommandProps<{
  userId: string;
}>;

export class DeleteUserMeCommand extends BaseCommand<
  IDeleteUserMeCommand,
  void,
  HandlerResult<DeleteUserMeCommandHandler>
> {
  static readonly code = asCommandCode('account:user:cmd:delete_me');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IDeleteUserMeCommand['data'], metadata: DrivenMessageMetadata) {
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
