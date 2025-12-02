import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { SecurityModule } from '../../infra/security/security.module';
import { DeviceModule } from '../device/device.module';
import { UserModule } from '../user/user.module';
import { LoginAuthCommandHandler } from './commands/login-auth/login-auth.command';
import { LogoutAuthCommandHandler } from './commands/logout-auth/logout-auth.command';
import { RefreshTokenAuthCommandHandler } from './commands/refresh-token-auth/refresh-token-auth.command';
import { RegisterAuthCommandHandler } from './commands/register-auth/register-auth.command';
import { AuthHttpController } from './interface/auth.http.controller';

const httpControllers = [AuthHttpController];
const commandHandlers: Provider[] = [
  RegisterAuthCommandHandler,
  LoginAuthCommandHandler,
  LogoutAuthCommandHandler,
  RefreshTokenAuthCommandHandler,
];
const queryHandlers: Provider[] = [];
const services: Provider[] = [];
const mappers: Provider[] = [];
const repositories: Provider[] = [];

@Module({
  imports: [CqrsModule, UserModule, SecurityModule, DeviceModule],
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
