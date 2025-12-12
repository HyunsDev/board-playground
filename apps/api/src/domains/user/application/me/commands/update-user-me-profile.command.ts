import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { HandlerResult } from '@workspace/backend-common';
import { AggregateCodeEnum, defineCommandCode } from '@workspace/domain';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { BaseCommand, BaseICommand } from '@/shared/base';

type IUpdateUserMeProfileCommand = BaseICommand<{
  userId: string;
  nickname?: string;
  bio?: string | null;
}>;

export class UpdateUserMeProfileCommand extends BaseCommand<
  IUpdateUserMeProfileCommand,
  HandlerResult<UpdateUserMeProfileCommandHandler>,
  UserEntity
> {
  readonly code = defineCommandCode('account:user:cmd:update_me_profile');
  readonly resourceType = AggregateCodeEnum.Account.User;

  constructor(
    data: IUpdateUserMeProfileCommand['data'],
    metadata: IUpdateUserMeProfileCommand['metadata'],
  ) {
    super(data.userId, data, metadata);
  }
}

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler
  implements ICommandHandler<UpdateUserMeProfileCommand>
{
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
