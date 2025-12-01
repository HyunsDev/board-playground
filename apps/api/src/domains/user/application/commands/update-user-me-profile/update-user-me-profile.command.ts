import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok } from 'neverthrow';

import { UserEntity } from '@/domains/user/domain/user.entity';
import { UserNotFoundError } from '@/domains/user/domain/user.errors';
import { UserRepositoryPort } from '@/domains/user/domain/user.repository.port';
import { USER_REPOSITORY } from '@/domains/user/user.constant';
import { CommandBase, CommandProps } from '@/shared/base';
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
export type UpdateUserMeProfileCommandResult = DomainResult<UserEntity, UserNotFoundError>;

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
    if (!user) return err(new UserNotFoundError());

    user.updateProfile({
      nickname: command.nickname,
      bio: command.bio,
    });

    await this.userRepo.save(user);

    return ok(user);
  }
}
