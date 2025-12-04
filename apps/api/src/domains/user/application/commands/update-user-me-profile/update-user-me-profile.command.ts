import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { CommandBase, CommandProps } from '@/shared/base';
import { InferErr } from '@/shared/types/infer-err.type';
import { DomainResult } from '@/shared/types/result.type';

export class UpdateUserMeProfileCommand extends CommandBase<UpdateUserMeProfileCommandResult> {
  public readonly userId: string;
  public readonly nickname?: string;
  public readonly bio?: string | null;

  constructor(props: CommandProps<UpdateUserMeProfileCommand, UpdateUserMeProfileCommandResult>) {
    super(props);
    this.userId = props.userId!;
    this.nickname = props.nickname;
    this.bio = props.bio;
  }
}
export type UpdateUserMeProfileCommandResult = DomainResult<
  UserEntity,
  InferErr<UserRepositoryPort['getOneById']> | InferErr<UserRepositoryPort['update']>
>;

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler
  implements ICommandHandler<UpdateUserMeProfileCommand, UpdateUserMeProfileCommandResult>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserMeProfileCommand) {
    const userResult = await this.userRepo.getOneById(command.userId);
    if (userResult.isErr()) return err(userResult.error);
    const user = userResult.value;

    user.updateProfile({
      nickname: command.nickname,
      bio: command.bio,
    });

    const updateResult = await this.userRepo.update(user);
    if (updateResult.isErr()) return err(updateResult.error);

    return ok(user);
  }
}
