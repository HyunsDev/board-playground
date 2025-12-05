import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserEntity } from '../../domain/user.entity';

import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { BaseCommand, CommandProps } from '@/shared/base';
import { HandlerResult } from '@/shared/types/handler-result';

type UpdateUserMeProfileCommandProps = CommandProps<{
  userId: string;
  nickname?: string;
  bio?: string | null;
}>;

export class UpdateUserMeProfileCommand extends BaseCommand<
  UpdateUserMeProfileCommandProps,
  HandlerResult<UpdateUserMeProfileCommandHandler>,
  UserEntity
> {}

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler
  implements ICommandHandler<UpdateUserMeProfileCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute({ data }: UpdateUserMeProfileCommandProps) {
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
