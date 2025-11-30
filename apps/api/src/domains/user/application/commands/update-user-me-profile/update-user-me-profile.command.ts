import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserNotFoundException } from '@/domains/user/domain/user.exceptions';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { CommandBase, CommandProps } from '@/shared/base';

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
export type UpdateUserMeProfileCommandResult = Result<UserEntity, UserNotFoundException>;

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler
  implements ICommandHandler<UpdateUserMeProfileCommand, UpdateUserMeProfileCommandResult>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserMeProfileCommand) {
    const user = await this.userRepo.findOneById(command.userId);
    if (!user) return err(new UserNotFoundException());

    user.updateProfile({
      nickname: command.nickname,
      bio: command.bio,
    });

    await this.userRepo.update(user);

    return ok(user);
  }
}
