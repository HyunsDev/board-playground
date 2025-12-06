import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { ForceLoginCommandHandler } from './commands/force-login.command';
import { ForceRegisterCommandHandler } from './commands/force-register.command';
import { DevtoolsController } from './devtools.controller';

import { AuthModule } from '@/domains/auth/auth.module';
import { UserModule } from '@/domains/user/user.module';

const commandHandlers: Provider[] = [ForceLoginCommandHandler, ForceRegisterCommandHandler];
const services: Provider[] = [];

@Module({
  imports: [CqrsModule, UserModule, AuthModule],
  controllers: [DevtoolsController],
  providers: [...commandHandlers, ...services],
})
export class DevtoolsModule {}
