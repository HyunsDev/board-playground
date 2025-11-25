import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';

import { UserRepositoryPort } from '../../database/user.repository.port';
import { UserEntity } from '../../domain/user.entity';
import { UserNotFoundException } from '../../domain/user.exceptions';
import { USER_REPOSITORY } from '../../user.di-tokens';

import { Command, CommandProps } from '@/libs/ddd';

export class UpdateUserMeProfileCommand extends Command {
  public readonly userId: string;
  public readonly nickname?: string;
  public readonly bio?: string | null;

  constructor(props: CommandProps<UpdateUserMeProfileCommand>) {
    super(props);
    this.userId = props.userId!;
    this.nickname = props.nickname;
    this.bio = props.bio;
  }
}

@CommandHandler(UpdateUserMeProfileCommand)
export class UpdateUserMeProfileCommandHandler
  implements ICommandHandler<UpdateUserMeProfileCommand>
{
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(
    command: UpdateUserMeProfileCommand,
  ): Promise<Result<UserEntity, UserNotFoundException>> {
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
