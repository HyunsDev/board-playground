import { Logger, Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AuthModule } from '../auth/auth.module';
import { DeviceModule } from '../device/device.module';
import { UserModule } from '../user/user.module';
import { LoginAuthCommandHandler } from './commands/login-auth/login-auth.command';
import { LoginAuthHttpController } from './commands/login-auth/login-auth.http.controller';
import { LogoutAuthCommandHandler } from './commands/logout-auth/logout-auth.command';
import { LogoutAuthHttpController } from './commands/logout-auth/logout-auth.http.controller';
import { RefreshTokenAuthCommandHandler } from './commands/refresh-token-auth/refresh-token-auth.command';
import { RefreshTokenAuthHttpController } from './commands/refresh-token-auth/refresh-token-auth.http.controller';
import { RegisterAuthCommandHandler } from './commands/register-auth/register-auth.command';
import { RegisterAuthHttpController } from './commands/register-auth/register-auth.http.controller';

const httpControllers = [
  RegisterAuthHttpController,
  LoginAuthHttpController,
  LogoutAuthHttpController,
  RefreshTokenAuthHttpController,
];
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
  imports: [CqrsModule, UserModule, AuthModule, DeviceModule],
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
export class IdentityModule {}
