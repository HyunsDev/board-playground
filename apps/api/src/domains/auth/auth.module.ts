import { Logger, Module, Provider } from '@nestjs/common';

import { MailerModule } from '@workspace/backend-core';

import { SessionModule } from '../session/session.module';
import { LogoutAuthCommandHandler } from './application/common/commands/logout-auth.command';
import { RefreshTokenAuthCommandHandler } from './application/common/commands/refresh-token-auth.command';
import { CheckUsernameAvailableQueryHandler } from './application/common/queries/check-username-available.query';
import { ChangePasswordCommandHandler } from './application/password/commands/change-password.command';
import { LoginWithPasswordCommandHandler } from './application/password/commands/login-with-password.command';
import { RegisterAuthCommandHandler } from './application/password/commands/register-auth.command';
import { ResetPasswordCommandHandler } from './application/password/commands/reset-password.command';
import { SendResetEmailCommandHandler } from './application/password/commands/send-reset-email.command';
import { SendVerificationEmailCommandHandler } from './application/password/commands/send-verification-email.command';
import { AuthPasswordHttpController } from './interface/auth-password.http.controller';
import { AuthHttpController } from './interface/auth.http.controller';
import { UserFacadeModule } from '../user/user.facade.module';

import { CryptoModule } from '@/infra/crypto';

const httpControllers = [AuthHttpController, AuthPasswordHttpController];
const commandHandlers: Provider[] = [
  RegisterAuthCommandHandler,
  LoginWithPasswordCommandHandler,
  LogoutAuthCommandHandler,
  RefreshTokenAuthCommandHandler,
  ChangePasswordCommandHandler,
  SendVerificationEmailCommandHandler,
  SendResetEmailCommandHandler,
  ResetPasswordCommandHandler,
];
const queryHandlers: Provider[] = [CheckUsernameAvailableQueryHandler];
const services: Provider[] = [];
const mappers: Provider[] = [];
const repositories: Provider[] = [];

@Module({
  imports: [UserFacadeModule, CryptoModule, SessionModule, MailerModule.forFeature()],
  providers: [
    Logger,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    ...mappers,
    ...repositories,
  ],
  controllers: [...httpControllers],
  exports: [],
})
export class AuthModule {}
