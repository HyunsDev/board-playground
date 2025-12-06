import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SecurityModule } from '../../infra/security/security.module';
import { SessionModule } from '../session/session.module';
import { UserModule } from '../user/user.module';
import { LoginAuthCommandHandler } from './application/commands/login-auth.command';
import { LogoutAuthCommandHandler } from './application/commands/logout-auth.command';
import { RefreshTokenAuthCommandHandler } from './application/commands/refresh-token-auth.command';
import { RegisterAuthCommandHandler } from './application/commands/register-auth.command';
import { AuthTokenService } from './application/services/auth-token.service';
import { AuthHttpController } from './interface/auth.http.controller';

const httpControllers = [AuthHttpController];
const commandHandlers: Provider[] = [
  RegisterAuthCommandHandler,
  LoginAuthCommandHandler,
  LogoutAuthCommandHandler,
  RefreshTokenAuthCommandHandler,
];
const queryHandlers: Provider[] = [];
const services: Provider[] = [AuthTokenService];
const mappers: Provider[] = [];
const repositories: Provider[] = [];

@Module({
  imports: [CqrsModule, UserModule, SecurityModule, SessionModule],
  providers: [
    Logger,
    ...commandHandlers,
    ...queryHandlers,
    ...services,
    ...mappers,
    ...repositories,
  ],
  controllers: [...httpControllers],
  exports: [AuthTokenService],
})
export class AuthModule {}
