import { Module, Provider } from '@nestjs/common';

import { MailerModule } from '@workspace/backend-core';

import { GetUserForAdminQueryHandler } from './admin/queries/get-user-for-admin.query';
import { UserActivityEventHandler } from './events/user-activity.event-handler';
import { UserPasswordChangedEventHandler } from './events/user-password-changed.event-handler';
import { UserFacade } from './facades/user.facade';
import { UserInfraModule } from '../infra/user-infra.module';
import { DeleteUserMeCommandHandler } from './me/commands/delete-user-me.command';
import { UpdateUserMeProfileCommandHandler } from './me/commands/update-user-me-profile.command';
import { UpdateUserMeUsernameCommandHandler } from './me/commands/update-user-me-username.command';
import { GetUserMeQueryHandler } from './me/queries/get-user-me.query';
import { GetUserQueryHandler } from './public/queries/get-user.query';
import { SearchUserQueryHandler } from './public/queries/search-user.query';

const commonHandlers: Provider[] = [
  // QueryHandlers
  GetUserQueryHandler,
  SearchUserQueryHandler,
];

const meHandlers: Provider[] = [
  // QueryHandlers
  GetUserMeQueryHandler,

  // CommandHandlers
  UpdateUserMeProfileCommandHandler,
  UpdateUserMeUsernameCommandHandler,
  DeleteUserMeCommandHandler,
];

const adminHandlers: Provider[] = [
  // QueryHandlers
  GetUserForAdminQueryHandler,
];

const eventHandlers: Provider[] = [UserActivityEventHandler, UserPasswordChangedEventHandler];

const facades: Provider[] = [UserFacade];

@Module({
  imports: [UserInfraModule, MailerModule.forFeature()],
  providers: [...commonHandlers, ...meHandlers, ...adminHandlers, ...eventHandlers, ...facades],
  exports: [UserFacade],
})
export class UserApplicationModule {}
