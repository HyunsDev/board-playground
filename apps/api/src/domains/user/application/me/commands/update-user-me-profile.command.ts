import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { CommandHandler, ICommandHandler } from '@workspace/backend-core';
import { BaseCommand, BaseCommandProps, DrivenMessageMetadata } from '@workspace/backend-core';
import { AggregateCodeEnum, asCommandCode } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
type IUpdateUserMeProfileCommand = BaseCommandProps<{
  userId: string;
  nickname?: string;
  bio?: string | null;
}>;

export class UpdateUserMeProfileCommand extends BaseCommand<
  IUpdateUserMeProfileCommand,
  UserEntity,
  HandlerResult<UpdateUserMeProfileCommandHandler>
> {
  static readonly code = asCommandCode('account:user:cmd:update_me_profile');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(data: IUpdateUserMeProfileCommand['data'], metadata: DrivenMessageMetadata) {
    super(data.userId, data, metadata);
  }
}

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler implements ICommandHandler<UpdateUserMeProfileCommand> {
  constructor(private readonly userRepo: UserRepositoryPort) {}

  async execute({ data }: IUpdateUserMeProfileCommand) {
    const userResult = await this.userRepo.getOneById(data.userId);
    if (userResult.isErr()) return err(userResult.error);
    const user = userResult.value;

    user.updateProfile({
      nickname: data.nickname,
      bio: data.bio,
    });

    const updateResult = await this.userRepo.update(user);
    if (updateResult.isErr()) return err(updateResult.error);

    return ok(user);
  }
}
