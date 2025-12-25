import { Logger, Module, Provider } from '@nestjs/common';

import { CoreBullBoardModule } from '@workspace/backend-core';

import { ForceLoginCommandHandler } from './commands/force-login.command';
import { ForceRegisterCommandHandler } from './commands/force-register.command';
import { ResetDBCommandHandler } from './commands/reset-db.command';
import { DevtoolsController } from './devtools.controller';

import { AuthModule } from '@/domains/auth/auth.module';
import { SessionModule } from '@/domains/session/session.module';
import { UserFacadeModule } from '@/domains/user/user.facade.module';

const commandHandlers: Provider[] = [
  ForceLoginCommandHandler,
  ForceRegisterCommandHandler,
  ResetDBCommandHandler,
];
const services: Provider[] = [];

@Module({
  imports: [UserFacadeModule, AuthModule, SessionModule, CoreBullBoardModule],
  controllers: [DevtoolsController],
  providers: [Logger, ...commandHandlers, ...services],
})
export class DevtoolsModule {}
