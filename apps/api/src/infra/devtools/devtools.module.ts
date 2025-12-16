import { Logger, Module, Provider } from '@nestjs/common';

import { ForceLoginCommandHandler } from './commands/force-login.command';
import { ForceRegisterCommandHandler } from './commands/force-register.command';
import { ResetDBCommandHandler } from './commands/reset-db.command';
import { DevtoolsController } from './devtools.controller';

import { AuthModule } from '@/domains/auth/auth.module';
import { SessionModule } from '@/domains/session/session.module';
import { UserModule } from '@/domains/user/user.module';

const commandHandlers: Provider[] = [
  ForceLoginCommandHandler,
  ForceRegisterCommandHandler,
  ResetDBCommandHandler,
];
const services: Provider[] = [];

@Module({
  imports: [UserModule, AuthModule, SessionModule],
  controllers: [DevtoolsController],
  providers: [Logger, ...commandHandlers, ...services],
})
export class DevtoolsModule {}
